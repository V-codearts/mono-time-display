import { useState, useEffect } from 'react';
import Gallery from '@/components/Gallery';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Gallery
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
    />
  );
};

export default Index;
