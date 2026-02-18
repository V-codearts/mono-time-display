import { useState } from 'react';

interface AboutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  onNavigate: (page: string) => void;
  currentPage: 'about' | 'other';
}

const About = ({ isDarkMode, onToggleTheme, onBack, onNavigate, currentPage }: AboutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const pageContent: Record<string, React.ReactNode> = {
    about: (
      <div className="w-full flex items-center justify-center h-screen">
        <p className="text-sm md:text-base text-muted-foreground tracking-wider uppercase">PORTFOLIO</p>
      </div>
    ),
    other: (
      <div className="w-full flex items-center justify-center h-screen">
        <p className="text-sm md:text-base text-muted-foreground tracking-wider uppercase">PORTFOLIO</p>
      </div>
    ),
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen">
      {/* Nav Menu Toggle */}
      <div className="fixed top-[18px] md:top-[24px] left-[18px] md:left-[24px] z-50">
        <div 
          className="text-lg md:text-2xl cursor-pointer transition-all duration-200 hover:font-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '−' : '+'}
        </div>
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
        >
          <div className="flex flex-col gap-2 text-xs md:text-sm tracking-wider uppercase">
            <span 
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200"
              onClick={onBack}
            >
              GALLERY
            </span>
            <span 
              className={`${currentPage === 'about' ? 'text-foreground cursor-default' : 'text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200'}`}
              onClick={() => currentPage !== 'about' && onNavigate('about')}
            >
              ABOUT
            </span>
            <span 
              className={`${currentPage === 'other' ? 'text-foreground cursor-default' : 'text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200'}`}
              onClick={() => currentPage !== 'other' && onNavigate('other')}
            >
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

      {/* Page Content */}
      <div className="flex flex-col items-center justify-start min-h-screen">
        {pageContent[currentPage]}
      </div>
    </div>
  );
};

export default About;
