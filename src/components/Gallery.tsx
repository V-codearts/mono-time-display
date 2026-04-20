import { useState, useRef, useEffect } from 'react';
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

const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;

  if (img.complete) {
    return typeof img.decode === 'function'
      ? img.decode().then(() => undefined).catch(() => undefined)
      : Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
};

// Placeholder items — swap `main` and `variations` URLs when real photos arrive.
const ITEMS: ItemData[] = [
  {
    id: 1,
    title: 'T',
    main: gallery1,
    variations: [gallery1, gallery2, gallery3, gallery4],
    description: '',
  },
  {
    id: 2,
    title: 'HOODIE',
    main: gallery2,
    variations: [gallery2, gallery3, gallery4, gallery5],
    description: '',
  },
  {
    id: 4,
    title: 'FUTURE DENIM',
    main: gallery4,
    variations: [gallery4, gallery5, gallery1, gallery2],
    description: '',
  },
];

const COLLECTION_IMAGE_SOURCES = Array.from(new Set(ITEMS.map((item) => item.main)));
const firstImageReadyPromise = preloadImage(ITEMS[0].main);
void Promise.all(COLLECTION_IMAGE_SOURCES.map(preloadImage));

const Gallery = ({ isDarkMode, onToggleTheme, onNavigate, menuOpen, setMenuOpen }: GalleryProps) => {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [firstReady, setFirstReady] = useState(false);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    firstImageReadyPromise.finally(() => {
      if (!cancelled) {
        setFirstReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

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
            className="text-foreground cursor-default font-normal transition-transform duration-300 ease-in-out whitespace-nowrap w-fit"
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDelay: menuOpen ? '0ms' : '100ms',
            }}
          >COLLECTION</span>
          <span
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-[color,transform] duration-200 ease-in-out whitespace-nowrap w-fit"
            style={{
              transform: menuOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
              transitionDuration: '200ms, 300ms',
              transitionDelay: menuOpen ? '0ms, 50ms' : '0ms, 50ms',
            }}
            onClick={() => onNavigate?.('about')}
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

      <div
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onToggleTheme}
      />

      <div className="flex flex-col items-center">
        {ITEMS.map((item, idx) => {
          const isFirst = idx === 0;
          return (
            <div
              key={item.id}
              className="h-screen w-full flex items-center justify-center"
            >
              <img
                src={item.main}
                alt={item.title}
                loading="eager"
                decoding="async"
                fetchPriority={isFirst ? 'high' : 'auto'}
                className={`max-w-[80vw] max-h-[80vh] object-contain cursor-pointer border border-foreground/20 transition-transform duration-300 ease-out hover:scale-105 ${
                  isFirst ? `transition-opacity duration-300 ease-out ${firstReady ? 'opacity-100' : 'opacity-0'}` : ''
                }`}
                onClick={() => handleSelectItem(item)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
