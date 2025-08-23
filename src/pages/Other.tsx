import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Other = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  // Theme toggle effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="bg-background text-foreground font-mono transition-all duration-1000 min-h-screen">
      {/* Return Arrow */}
      <div 
        className="fixed top-[54px] md:top-[72px] left-[18px] md:left-[24px] text-lg md:text-2xl font-normal cursor-pointer hover:font-bold transition-all duration-200 z-50"
        onClick={goBack}
      >
        &lt;
      </div>
      
      {/* Theme Toggle Dot */}
      <div 
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={toggleTheme}
      />
      
      {/* Content Area - Empty for now */}
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-lg md:text-2xl font-normal tracking-wider">
            OTHER
          </div>
        </div>
      </div>
    </div>
  );
};

export default Other;