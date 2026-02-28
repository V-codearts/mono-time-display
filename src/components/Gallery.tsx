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

  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const date = time.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="bg-background text-foreground font-mono min-h-screen">
      {/* Nav Menu Toggle */}
      <div className="fixed top-[9px] md:top-[15px] left-[18px] md:left-[24px] z-50">
        <div 
          className="text-xl cursor-pointer transition-all duration-200 hover:font-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '−' : '+'}
        </div>
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'}`}
        >
          <div className="flex flex-col gap-0.5 tracking-wider uppercase">
            <span className="text-foreground cursor-default font-normal">COLLECTION</span>
            <span 
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200"
              onClick={() => onNavigate?.('about')}
            >
              ABOUT
            </span>
            <span className="text-muted-foreground cursor-default">
              OTHER
            </span>
          </div>
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
          <div className="text-sm md:text-base">{dayName} {date}</div>
          <div className="text-sm md:text-base mt-1">{timeStr}</div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;