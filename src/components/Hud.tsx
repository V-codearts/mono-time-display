interface HudProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate: (page: string) => void;
  currentPage: 'gallery' | 'about' | 'other';
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  inspecting?: boolean;
  onBack?: () => void;
}

const MORPH_MS = 180;

const Hud = ({ onToggleTheme, onNavigate, currentPage, menuOpen, setMenuOpen, inspecting = false, onBack }: HudProps) => {
  const effectiveMenuOpen = menuOpen && !inspecting;

  const itemClass = (page: 'gallery' | 'about' | 'other', interactive: boolean) => {
    const isCurrent = currentPage === page;
    if (isCurrent) {
      return 'text-foreground cursor-default font-normal transition-transform duration-300 ease-in-out whitespace-nowrap w-fit';
    }
    if (interactive) {
      return 'text-muted-foreground cursor-pointer hover:text-foreground transition-[transform,color] ease-in-out whitespace-nowrap w-fit';
    }
    return 'text-muted-foreground cursor-default transition-transform duration-300 ease-in-out whitespace-nowrap w-fit';
  };

  const handleGlyphClick = () => {
    if (inspecting) {
      onBack?.();
    } else {
      setMenuOpen(!menuOpen);
    }
  };

  return (
    <>
      <div className="fixed top-[9px] md:top-[15px] left-[18px] md:left-[24px] z-50 isolate">
        {/* Blurred aura: masks images that pass beneath the nav. Invisible over empty bg. */}
        <div
          aria-hidden
          className="absolute pointer-events-none -z-10"
          style={{
            top: '-141px',
            left: '-146px',
            width: '302px',
            height: '320px',
            background: 'hsl(var(--background))',
            borderRadius: '9999px',
            filter: 'blur(18px)',
            transformOrigin: '146px 141px',
            transform: effectiveMenuOpen
              ? 'translateX(0) scale(1)'
              : 'translateX(calc(-100% - 24px)) scale(0)',
            transition: 'background-color 0.5s ease, transform 300ms ease-in-out',
            transitionDelay: effectiveMenuOpen ? '0ms' : '300ms',
          }}
        />
        <div
          className="relative text-xl cursor-pointer transition-all duration-200 hover:font-bold"
          onClick={handleGlyphClick}
        >
          {/* Plus / minus toggle (hidden during inspect) */}
          <span
            className="transition-opacity"
            style={{
              opacity: inspecting ? 0 : (menuOpen ? 0 : 1),
              transitionDuration: `${MORPH_MS}ms`,
            }}
          >
            +
          </span>
          <span
            className="absolute left-0 top-0 transition-opacity"
            style={{
              opacity: inspecting ? 0 : (menuOpen ? 1 : 0),
              transitionDuration: `${MORPH_MS}ms`,
            }}
          >
            −
          </span>
          {/* Back arrow (only during inspect) — morphs in as plus/minus fade out */}
          <span
            className="absolute left-0 top-0 transition-opacity"
            style={{
              opacity: inspecting ? 1 : 0,
              transitionDuration: `${MORPH_MS}ms`,
              pointerEvents: inspecting ? 'auto' : 'none',
            }}
          >
            &lt;
          </span>
        </div>

        <div className="flex flex-col gap-0.5 tracking-wider uppercase mt-1 overflow-visible">
          <span
            className={itemClass('gallery', true)}
            style={{
              transform: effectiveMenuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDuration: currentPage === 'gallery' ? '300ms' : '300ms, 200ms',
              transitionDelay: effectiveMenuOpen ? '100ms' : '200ms',
            }}
            onClick={() => !inspecting && currentPage !== 'gallery' && onNavigate('gallery')}
          >
            COLLECTION
          </span>
          <span
            className={itemClass('other', true)}
            style={{
              transform: effectiveMenuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDuration: currentPage === 'other' ? '300ms' : '300ms, 200ms',
              transitionDelay: effectiveMenuOpen ? '200ms, 0ms' : '100ms, 0ms',
            }}
            onClick={() => !inspecting && currentPage !== 'other' && onNavigate('other')}
          >
            MORE
          </span>
          <span
            className={itemClass('about', true)}
            style={{
              transform: effectiveMenuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDuration: currentPage === 'about' ? '300ms' : '300ms, 200ms',
              transitionDelay: effectiveMenuOpen ? '300ms, 0ms' : '0ms, 0ms',
            }}
            onClick={() => !inspecting && currentPage !== 'about' && onNavigate('about')}
          >
            ABOUT
          </span>
        </div>
      </div>

      <div
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onToggleTheme}
      />
    </>
  );
};

export default Hud;
