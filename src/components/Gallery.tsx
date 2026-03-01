import { useState, useEffect } from 'react';

interface GalleryProps {
  onBack?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate?: (page: string) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const Gallery = ({ isDarkMode, onToggleTheme, onNavigate, menuOpen, setMenuOpen }: GalleryProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const year = time.getFullYear();
  const date = `${month} ${day} ${year}`;
  const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="bg-background text-foreground font-mono min-h-screen">
      {/* Nav Menu Toggle */}
      <div className="fixed top-[9px] md:top-[15px] left-[18px] md:left-[24px] z-50">
        <div 
          className="relative text-xl cursor-pointer transition-all duration-200 hover:font-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`transition-opacity duration-200 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}>+</span>
          <span className={`absolute left-0 top-0 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}>−</span>
        </div>
        
        <div className="flex flex-col gap-0.5 tracking-wider uppercase mt-1 overflow-visible">
          <span 
            className="text-foreground cursor-default font-normal transition-transform duration-300 ease-in-out whitespace-nowrap"
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDelay: menuOpen ? '0ms' : '100ms',
            }}
          >COLLECTION</span>
          <span 
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-transform duration-300 ease-in-out whitespace-nowrap"
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDelay: menuOpen ? '50ms' : '50ms',
            }}
            onClick={() => onNavigate?.('about')}
          >
            ABOUT
          </span>
          <span 
            className="text-muted-foreground cursor-default transition-transform duration-300 ease-in-out whitespace-nowrap"
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDelay: menuOpen ? '100ms' : '0ms',
            }}
          >
            OTHER
          </span>
        </div>
      </div>

      {/* Theme Toggle Dot */}
      <div 
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onToggleTheme}
      />

      {/* Time Display */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center tracking-widest uppercase">
          <div className="text-sm md:text-base">{date}</div>
          <div className="text-sm md:text-base mt-1">{timeStr}</div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;