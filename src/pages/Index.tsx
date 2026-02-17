import { useState, useEffect, useCallback } from 'react';
import Gallery from '@/components/Gallery';
import IntroVideo from '@/components/IntroVideo';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [showIntro, setShowIntro] = useState(true);
  const [galleryFadingIn, setGalleryFadingIn] = useState(true);

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
    // Start at opacity 0, then trigger fade to 1 on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setGalleryFadingIn(false);
      });
    });
  }, []);

  if (showIntro) {
    return <IntroVideo isDarkMode={isDarkMode} onComplete={handleIntroComplete} />;
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
      />
    </div>
  );
};

export default Index;
