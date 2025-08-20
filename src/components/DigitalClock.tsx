import { useState, useEffect } from 'react';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-mono">
      <div className="text-center space-y-4">
        <div className="text-4xl md:text-6xl font-medium tracking-wider">
          {formatDay(time)}
        </div>
        <div className="text-2xl md:text-4xl font-normal tracking-wide text-muted-foreground">
          {formatDate(time)}
        </div>
        <div className="text-3xl md:text-5xl font-medium tracking-widest">
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};

export default DigitalClock;