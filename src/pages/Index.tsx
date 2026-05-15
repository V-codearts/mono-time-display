import { useState, useEffect, useCallback, useRef } from 'react';
import Gallery from '@/components/Gallery';
import Archive from '@/components/Archive';
import IntroVideo from '@/components/IntroVideo';
import About from '@/pages/About';
import Hud from '@/components/Hud';

type Page = 'gallery' | 'about' | 'other' | 'archive';

const SLIDE_MS = 600;
const SLIDE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [showIntro, setShowIntro] = useState(true);
  const [introEntering, setIntroEntering] = useState(true);
  const [displayedPage, setDisplayedPage] = useState<Page>('gallery');
  const [outgoingPage, setOutgoingPage] = useState<Page | null>(null);
  const [incomingActive, setIncomingActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hudVisible, setHudVisible] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [outgoingScroll, setOutgoingScroll] = useState(0);
  const transitionTimer = useRef<number | null>(null);
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
        setIntroEntering(false);
      });
    });
  }, []);

  const goToPage = useCallback((page: Page) => {
    setDisplayedPage((curr) => {
      if (curr === page || outgoingPage) return curr;
      setOutgoingScroll(window.scrollY);
      window.scrollTo(0, 0);
      setOutgoingPage(curr);
      setIncomingActive(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIncomingActive(true));
      });
      if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
      transitionTimer.current = window.setTimeout(() => {
        setOutgoingPage(null);
        transitionTimer.current = null;
      }, SLIDE_MS);
      return page;
    });
  }, [outgoingPage]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'gallery' || page === 'about' || page === 'other' || page === 'archive') goToPage(page);
  };

  const handleBackHandlerReady = useCallback((handler: (() => void) | null) => {
    galleryBackRef.current = handler;
  }, []);

  const handleHudBack = useCallback(() => {
    if (displayedPage === 'about') {
      goToPage('other');
      return;
    }
    if (displayedPage === 'archive' && !galleryBackRef.current) {
      goToPage('other');
      return;
    }
    galleryBackRef.current?.();
  }, [displayedPage, goToPage]);

  const renderPage = (page: Page) => {
    if (page === 'about' || page === 'other') {
      return <About currentPage={page} onNavigate={handleNavigate} />;
    }
    if (page === 'archive') {
      return (
        <Archive
          onInspectChange={setInspecting}
          onBackHandlerReady={handleBackHandlerReady}
        />
      );
    }
    return (
      <Gallery
        entering={introEntering}
        onInspectChange={setInspecting}
        onBackHandlerReady={handleBackHandlerReady}
      />
    );
  };

  if (showIntro) {
    return <IntroVideo isDarkMode={isDarkMode} onComplete={handleIntroComplete} />;
  }

  const hudCurrentPage: 'gallery' | 'about' | 'other' =
    displayedPage === 'archive' ? 'other' : displayedPage;

  const transitioning = outgoingPage !== null;

  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-10 bg-background" />

      {hudVisible && (
        <Hud
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          currentPage={hudCurrentPage}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          inspecting={inspecting || displayedPage === 'about' || displayedPage === 'archive'}
          onBack={handleHudBack}
          entering={introEntering}
        />
      )}

      <div
        key={displayedPage}
        style={{
          transform: transitioning && !incomingActive ? 'translateY(100vh)' : 'translateY(0)',
          transition: transitioning ? `transform ${SLIDE_MS}ms ${SLIDE_EASE}` : undefined,
          willChange: transitioning ? 'transform' : undefined,
        }}
      >
        {renderPage(displayedPage)}
      </div>

      {outgoingPage && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 overflow-hidden bg-background pointer-events-none"
          style={{
            transform: incomingActive ? 'translateY(-100vh)' : 'translateY(0)',
            transition: `transform ${SLIDE_MS}ms ${SLIDE_EASE}`,
            willChange: 'transform',
          }}
        >
          <div style={{ transform: `translateY(-${outgoingScroll}px)` }}>
            {renderPage(outgoingPage)}
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
