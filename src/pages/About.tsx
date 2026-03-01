

interface AboutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  onNavigate: (page: string) => void;
  currentPage: 'about' | 'other';
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const About = ({ isDarkMode, onToggleTheme, onBack, onNavigate, currentPage, menuOpen, setMenuOpen }: AboutProps) => {

  const pageContent: Record<string, React.ReactNode> = {
    about: (
      <div className="w-full flex items-center justify-center h-screen">
        <p className="text-foreground tracking-wider uppercase">PORTFOLIO</p>
      </div>
    ),
    other: (
      <div className="w-full flex items-center justify-center h-screen">
        <p className="text-foreground tracking-wider uppercase">PORTFOLIO</p>
      </div>
    ),
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen">
      {/* Nav Menu Toggle */}
      <div className="fixed top-[9px] md:top-[15px] left-[18px] md:left-[24px] z-50">
        <div 
          className="relative text-xl cursor-pointer transition-all duration-200 hover:font-bold w-5 h-6 flex items-center justify-center"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`absolute transition-opacity duration-200 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}>+</span>
          <span className={`absolute transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}>−</span>
        </div>
        
        <div
          className={`transition-all duration-300 ease-in-out mt-1 ${menuOpen ? 'max-h-96' : 'max-h-0'}`}
          style={{ clipPath: 'inset(0 0 0 -20px)' }}
        >
          <div className="flex flex-col gap-0.5 tracking-wider uppercase">
            <span 
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-transform duration-300 ease-in-out"
              style={{
                transform: menuOpen ? 'translateX(0)' : 'translateX(-12px)',
                transitionDelay: menuOpen ? '0ms' : '100ms',
              }}
              onClick={onBack}
            >
              COLLECTION
            </span>
            <span 
              className={`${currentPage === 'about' ? 'text-foreground cursor-default' : 'text-muted-foreground cursor-pointer hover:text-foreground'} transition-transform duration-300 ease-in-out`}
              style={{
                transform: menuOpen ? 'translateX(0)' : 'translateX(-12px)',
                transitionDelay: menuOpen ? '50ms' : '50ms',
              }}
              onClick={() => currentPage !== 'about' && onNavigate('about')}
            >
              ABOUT
            </span>
            <span 
              className="text-muted-foreground cursor-default transition-transform duration-300 ease-in-out"
              style={{
                transform: menuOpen ? 'translateX(0)' : 'translateX(-12px)',
                transitionDelay: menuOpen ? '100ms' : '0ms',
              }}
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
