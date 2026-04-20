

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
      <div className="w-full flex flex-col items-center justify-center h-screen">
        <p className="text-foreground tracking-wider uppercase">PORTFOLIO</p>
        <p className="text-foreground tracking-wider uppercase" style={{ marginTop: '1em' }}>PHOTOGRAPHY BY BENJAMIN LAARKO</p>
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
          className="relative text-xl cursor-pointer transition-all duration-200 hover:font-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`transition-opacity duration-200 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}>+</span>
          <span className={`absolute left-0 top-0 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}>−</span>
        </div>
        
        <div className="flex flex-col gap-0.5 tracking-wider uppercase mt-1 overflow-visible">
          <span 
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-[transform,color] duration-300 ease-in-out whitespace-nowrap w-fit"
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDuration: '300ms, 200ms',
              transitionDelay: menuOpen ? '100ms, 0ms' : '100ms, 0ms',
            }}
            onClick={onBack}
          >
            COLLECTION
          </span>
          <span 
            className={`${currentPage === 'about' ? 'text-foreground cursor-default font-normal' : 'text-muted-foreground cursor-pointer hover:text-foreground'} transition-[transform,color] ease-in-out whitespace-nowrap w-fit`}
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDuration: '300ms, 200ms',
              transitionDelay: menuOpen ? '50ms, 0ms' : '50ms, 0ms',
            }}
            onClick={() => currentPage !== 'about' && onNavigate('about')}
          >
            ABOUT
          </span>
          <span 
            className="text-muted-foreground cursor-default transition-transform duration-300 ease-in-out whitespace-nowrap w-fit"
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

      {/* Page Content */}
      <div className="flex flex-col items-center justify-start min-h-screen">
        {pageContent[currentPage]}
      </div>
    </div>
  );
};

export default About;
