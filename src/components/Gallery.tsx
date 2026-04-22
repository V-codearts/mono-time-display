import { useState, useRef, useEffect } from 'react';
import ImageViewer from '@/components/ImageViewer';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';

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

const ITEMS: ItemData[] = [
  {
    id: 1,
    title: '⊥',
    main: gallery1,
    variations: [gallery1, gallery2, gallery3, gallery4],
    description: 'SEAMLESS\nBANANA PEEL TANNIN DYED\n"WET GRAVEL"',
  },
  {
    id: 2,
    title: 'ZIP HOODIE',
    main: gallery2,
    variations: [gallery2, gallery3, gallery4, gallery5],
    description: 'SEAMLESS',
  },
  {
    id: 4,
    title: 'DENIM PANT',
    main: gallery4,
    variations: [gallery4, gallery5, gallery1, gallery2],
    description: 'FULL SEAMLESS WRAP AROUND CONSTRUCTION\nELASTIC WAISTBAND\nYES, BACK ZIP',
  },
];

const COLLECTION_IMAGE_SOURCES = Array.from(new Set(ITEMS.map((item) => item.main)));
const firstImageReadyPromise = preloadImage(ITEMS[0].main);
void Promise.all(COLLECTION_IMAGE_SOURCES.map(preloadImage));

interface GalleryProps {
  onInspectChange?: (inspecting: boolean) => void;
}

const Gallery = ({ onInspectChange }: GalleryProps) => {
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
    onInspectChange?.(true);
  };

  const handleBack = () => {
    setSelectedItem(null);
    onInspectChange?.(false);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosRef.current);
    });
  };

  if (selectedItem) {
    return <ImageViewer image={selectedItem} onBack={handleBack} />;
  }

  return (
    <div className="bg-background text-foreground font-mono min-h-screen">
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
