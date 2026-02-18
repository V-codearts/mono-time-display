import { useState, useEffect, useCallback } from 'react';
import Gallery from '@/components/Gallery';
import IntroVideo from '@/components/IntroVideo';
import About from '@/pages/About';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [showIntro, setShowIntro] = useState(true);
  const [galleryFadingIn, setGalleryFadingIn] = useState(true);
  const [currentPage, setCurrentPage] = useState<'gallery' | 'about' | 'other'>('gallery');
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleNavigate = (page: string) => {
    if (page === 'about' || page === 'other') setCurrentPage(page as 'about' | 'other');
  };

  if (showIntro) {
    return <IntroVideo isDarkMode={isDarkMode} onComplete={handleIntroComplete} />;
  }

  if (currentPage === 'about' || currentPage === 'other') {
    return (
      <About
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onBack={() => setCurrentPage('gallery')}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
    );
  }

  return (
    <div
      style={{
        opacity: galleryFadingIn ? 0 : 1,
        transition: galleryFadingIn ? 'none' : 'opacity 0.5s ease-out',
      }}
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
