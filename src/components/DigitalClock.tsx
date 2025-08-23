import { useState, useEffect, useRef } from 'react';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const [isIdle, setIsIdle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCompactView, setIsCompactView] = useState(false);
  const collectionRef = useRef<HTMLDivElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Theme toggle effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Idle detection
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 3000); // 3 seconds of inactivity
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    // Initialize timer
    resetIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const scrollToOther = () => {
    otherRef.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleCompactView = () => {
    setIsCompactView(!isCompactView);
  };

  if (isCompactView) {
    return (
      <div className={`bg-background text-foreground font-mono transition-all duration-1000 ${isIdle ? 'opacity-30' : 'opacity-100'} min-h-screen flex flex-col`}>
        {/* Compact View Toggle */}
        <div 
          className="fixed top-[18px] md:top-[24px] left-[18px] md:left-[24px] text-lg md:text-2xl font-normal cursor-pointer hover:font-bold transition-all duration-200 z-50"
          onClick={toggleCompactView}
        >
          -
        </div>
        
        {/* Theme Toggle Dot */}
        <div 
          className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
          onClick={toggleTheme}
        />
        
        {/* All Sections in One Page */}
        <div className="flex-1 flex flex-col justify-evenly items-center p-8">
          {/* Clock Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-lg md:text-2xl font-normal tracking-wider leading-tight transform translate-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {formatDay(time)}
            </div>
            <div className="text-lg md:text-2xl font-normal tracking-wide leading-tight transform translate-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {formatDate(time)}
            </div>
            <div className="text-lg md:text-2xl font-normal tracking-widest leading-tight transform translate-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {formatTime(time)}
            </div>
          </div>

          {/* Collection Section */}
          <div className="text-center transform translate-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-lg md:text-2xl font-normal tracking-wider hover:font-bold transition-all duration-200">
              COLLECTION
            </div>
          </div>

          {/* Other Section */}
          <div className="text-center transform translate-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-lg md:text-2xl font-normal tracking-wider hover:font-bold transition-all duration-200">
              OTHER
            </div>
          </div>

          {/* About Section */}
          <div className="text-center transform translate-y-4 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="text-lg md:text-2xl font-normal tracking-wider hover:font-bold transition-all duration-200">
              ABOUT
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background text-foreground font-mono transition-all duration-1000 ${isIdle ? 'opacity-30' : 'opacity-100'}`}>
      {/* Compact View Toggle */}
      <div 
        className="fixed top-[18px] md:top-[24px] left-[18px] md:left-[24px] text-lg md:text-2xl font-normal cursor-pointer hover:font-bold transition-all duration-200 z-50"
        onClick={toggleCompactView}
      >
        +
      </div>
      
      {/* Theme Toggle Dot */}
      <div 
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={toggleTheme}
      />
      
      {/* Clock Section */}
      <div 
        className="min-h-screen flex flex-col items-center justify-center cursor-pointer"
        onClick={scrollToCollection}
      >
        <div className="text-center leading-tight">
          <div className="text-lg md:text-2xl font-normal tracking-wider leading-tight">
            {formatDay(time)}
          </div>
          <div className="text-lg md:text-2xl font-normal tracking-wide leading-tight">
            {formatDate(time)}
          </div>
          <div className="text-lg md:text-2xl font-normal tracking-widest leading-tight">
            {formatTime(time)}
          </div>
        </div>
      </div>

      {/* Collection Section */}
      <div 
        ref={collectionRef}
        className="min-h-screen flex flex-col items-center justify-center cursor-pointer"
        onClick={scrollToOther}
      >
        <div className="text-center">
          <div className="text-lg md:text-2xl font-normal tracking-wider hover:font-bold transition-all duration-200">
            COLLECTION
          </div>
        </div>
      </div>

      {/* Other Section */}
      <div 
        ref={otherRef}
        className="min-h-screen flex flex-col items-center justify-center cursor-pointer"
        onClick={scrollToAbout}
      >
        <div className="text-center">
          <div className="text-lg md:text-2xl font-normal tracking-wider hover:font-bold transition-all duration-200">
            OTHER
          </div>
        </div>
      </div>

      {/* About Section */}
      <div 
        ref={aboutRef}
        className="min-h-screen flex flex-col items-center justify-center cursor-pointer"
        onClick={scrollToTop}
      >
        <div className="text-center">
          <div className="text-lg md:text-2xl font-normal tracking-wider hover:font-bold transition-all duration-200">
            ABOUT
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalClock;