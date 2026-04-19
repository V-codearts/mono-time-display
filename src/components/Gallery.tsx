import { useState, useRef } from 'react';
import ImageViewer from '@/components/ImageViewer';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';

interface GalleryProps {
  onBack?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate?: (page: string) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

interface ItemData {
  id: number;
  title: string;
  main: string;
  variations: string[];
  description: string;
}

// Placeholder items — swap `main` and `variations` URLs when real photos arrive.
const PLACEHOLDER = '/placeholder.svg';

const ITEMS: ItemData[] = [
  {
    id: 1,
    title: 'T',
    main: PLACEHOLDER,
    variations: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    description: '',
  },
  {
    id: 2,
    title: 'HOODIE',
    main: PLACEHOLDER,
    variations: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    description: '',
  },
  {
    id: 3,
    title: 'SHERPA JACKET',
    main: PLACEHOLDER,
    variations: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    description: '',
  },
  {
    id: 4,
    title: 'FUTURE DENIM',
    main: PLACEHOLDER,
    variations: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    description: '',
  },
];

const Gallery = ({ isDarkMode, onToggleTheme, onNavigate, menuOpen, setMenuOpen }: GalleryProps) => {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const scrollPosRef = useRef(0);

  const handleSelectItem = (item: ItemData) => {
    scrollPosRef.current = window.scrollY;
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosRef.current);
    });
  };

  if (selectedItem) {
    return (
      <ImageViewer
        image={selectedItem}
        onBack={handleBack}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />
    );
  }

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

      {/* Collection Items — vertical stack */}
      <div className="flex flex-col items-center pt-24 pb-16 gap-24">
        {ITEMS.map((item) => (
          <img
            key={item.id}
            src={item.main}
            alt={item.title}
            className="max-w-[80vw] max-h-[70vh] object-contain cursor-pointer border border-foreground/20"
            onClick={() => handleSelectItem(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
