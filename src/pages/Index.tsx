import { useState, useEffect, useCallback, useRef } from 'react';
import Gallery from '@/components/Gallery';
import IntroVideo from '@/components/IntroVideo';
import About from '@/pages/About';

type Page = 'gallery' | 'about' | 'other';

const FADE_MS = 200;

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
  const switchTimer = useRef<number | null>(null);

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
    if (page === 'about' || page === 'other') goToPage(page);
  };

  if (showIntro) {
    return <IntroVideo isDarkMode={isDarkMode} onComplete={handleIntroComplete} />;
  }

  const fadeStyle = {
    opacity: pageOpacity,
    transition: `opacity ${FADE_MS}ms ease-out`,
  };

  if (displayedPage === 'about' || displayedPage === 'other') {
    return (
      <div style={fadeStyle}>
        <About
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onBack={() => goToPage('gallery')}
          onNavigate={handleNavigate}
          currentPage={displayedPage}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      </div>
    );
  }

  return (
    <div
      style={
        galleryFadingIn
          ? { opacity: 0, transition: 'none' }
          : { opacity: pageOpacity, transition: `opacity ${FADE_MS}ms ease-out` }
      }
    >
      <Gallery
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
    </div>
  );
};

export default Index;
