import { useState, useEffect, useRef } from 'react';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const collectionRef = useRef<HTMLDivElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  return (
    <div className="bg-background text-foreground font-mono">
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
          <div className="text-2xl md:text-4xl font-normal tracking-wider">
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
          <div className="text-2xl md:text-4xl font-normal tracking-wider">
            OTHER
          </div>
        </div>
      </div>

      {/* About Section */}
      <div 
        ref={aboutRef}
        className="min-h-screen flex flex-col items-center justify-center"
      >
        <div className="text-center">
          <div className="text-2xl md:text-4xl font-normal tracking-wider">
            ABOUT
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalClock;