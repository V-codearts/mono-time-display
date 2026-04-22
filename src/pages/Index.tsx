import { useState, useEffect, useCallback, useRef } from 'react';
import Gallery from '@/components/Gallery';
import IntroVideo from '@/components/IntroVideo';
import About from '@/pages/About';
import Hud from '@/components/Hud';

type Page = 'gallery' | 'about' | 'other';

const FADE_MS = 134;

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [showIntro, setShowIntro] = useState(true);
  const [galleryFadingIn, setGalleryFadingIn] = useState(true);
  const [displayedPage, setDisplayedPage] = useState<Page>('gallery');
  const [pageOpacity, setPageOpacity] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hudVisible, setHudVisible] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const switchTimer = useRef<number | null>(null);
  const galleryBackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setHudVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setGalleryFadingIn(false);
      });
    });
  }, []);

  const goToPage = useCallback((page: Page) => {
    setDisplayedPage((curr) => {
      if (curr === page) return curr;
      setPageOpacity(0);
      if (switchTimer.current) window.clearTimeout(switchTimer.current);
      switchTimer.current = window.setTimeout(() => {
        setDisplayedPage(page);
        requestAnimationFrame(() => setPageOpacity(1));
      }, FADE_MS);
      return curr;
    });
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'gallery' || page === 'about' || page === 'other') goToPage(page);
  };

  const handleBackHandlerReady = useCallback((handler: (() => void) | null) => {
    galleryBackRef.current = handler;
  }, []);

  const handleHudBack = useCallback(() => {
    galleryBackRef.current?.();
  }, []);

  if (showIntro) {
    return <IntroVideo isDarkMode={isDarkMode} onComplete={handleIntroComplete} />;
  }

  const fadeStyle = {
    opacity: pageOpacity,
    transition: `opacity ${FADE_MS}ms ease-out`,
  };

  return (
    <>
      {hudVisible && (
        <Hud
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          currentPage={displayedPage}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          inspecting={inspecting}
          onBack={handleHudBack}
        />
      )}

      {displayedPage === 'about' || displayedPage === 'other' ? (
        <div style={fadeStyle}>
          <About currentPage={displayedPage} />
        </div>
      ) : (
        <div
          style={
            galleryFadingIn
              ? { opacity: 0, transition: 'none' }
              : { opacity: pageOpacity, transition: `opacity ${FADE_MS}ms ease-out` }
          }
        >
          <Gallery onInspectChange={setInspecting} onBackHandlerReady={handleBackHandlerReady} />
        </div>
      )}
    </>
  );
};

export default Index;
