

type NavPage = 'gallery' | 'media' | 'archive' | 'about';

interface HudProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate: (page: string) => void;
  currentPage: 'gallery' | 'about' | 'archive';
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  inspecting?: boolean;
  onBack?: () => void;
  entering?: boolean;
}

const NAV_ITEMS: { label: string; page: NavPage; interactive: boolean }[] = [
  { label: 'COLLECTION', page: 'gallery', interactive: true },
  { label: 'MEDIA', page: 'media', interactive: false },
  { label: 'ARCHIVE', page: 'archive', interactive: true },
  { label: 'ABOUT', page: 'about', interactive: true },
];

const MORPH_MS = 180;
const ENTER_MS = 600;
const ENTER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const Hud = ({ onToggleTheme, onNavigate, currentPage, menuOpen, setMenuOpen, inspecting = false, onBack, entering = false }: HudProps) => {
  const effectiveMenuOpen = menuOpen && !inspecting;

  const itemClass = (page: NavPage, interactive: boolean) => {
    const isCurrent = currentPage === page;
    if (isCurrent) {
      return 'text-foreground cursor-default font-normal transition-transform duration-300 ease-in-out whitespace-nowrap w-fit';
    }
    if (interactive) {
      return 'text-muted-foreground cursor-pointer hover:text-foreground hover:font-bold transition-[transform,color,font-weight] ease-in-out whitespace-nowrap w-fit';
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
        <div
          className="relative text-xl cursor-pointer transition-all duration-200 hover:font-bold w-[0.6em]"
          onClick={handleGlyphClick}
          style={{
            transform: entering ? 'translateX(calc(-100% - 24px))' : 'translateX(0)',
            transition: `transform ${ENTER_MS}ms ${ENTER_EASE}`,
          }}
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

        <div className="flex flex-col gap-0.5 tracking-wider uppercase mt-0 overflow-visible">
          {NAV_ITEMS.map((item, i) => (
            <span
              key={item.page}
              className={itemClass(item.page, item.interactive)}
              style={{
                transform: effectiveMenuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
                transitionDuration: currentPage === item.page ? '300ms' : '300ms, 200ms',
                transitionDelay: effectiveMenuOpen
                  ? `${100 + i * 100}ms`
                  : `${(NAV_ITEMS.length - i) * 100}ms`,
              }}
              onClick={() =>
                item.interactive &&
                !inspecting &&
                currentPage !== item.page &&
                onNavigate(item.page)
              }
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        style={
          entering
            ? {
                transform: 'translateX(calc(100% + 24px))',
                transitionDuration: `${ENTER_MS}ms`,
                transitionTimingFunction: ENTER_EASE,
              }
            : {
                transitionDuration: `${ENTER_MS}ms, 200ms`,
                transitionTimingFunction: `${ENTER_EASE}, ease`,
              }
        }
        onClick={onToggleTheme}
      />
    </>
  );
};

export default Hud;
