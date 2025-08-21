import { useState, useEffect, useRef } from 'react';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const [isIdle, setIsIdle] = useState(false);
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

  return (
    <div className={`bg-background text-foreground font-mono transition-opacity duration-500 ${isIdle ? 'opacity-30' : 'opacity-100'}`}>
      {/* Clock Section */}
      <div 
        className="min-h-screen flex flex-col items-center justify-center cursor-pointer"
        onClick={scrollToCollection}
      >
        <div className="text-center space-y-4">
          <div className="text-2xl md:text-4xl font-normal tracking-wider">
            {formatDay(time)}
          </div>
          <div className="text-2xl md:text-4xl font-normal tracking-wide">
            {formatDate(time)}
          </div>
          <div className="text-2xl md:text-4xl font-normal tracking-widest">
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
          <div className="text-2xl md:text-4xl font-normal tracking-wider hover:font-bold transition-all duration-200">
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
          <div className="text-2xl md:text-4xl font-normal tracking-wider hover:font-bold transition-all duration-200">
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
          <div className="text-2xl md:text-4xl font-normal tracking-wider hover:font-bold transition-all duration-200">
            ABOUT
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalClock;