import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import ImageViewer, { ImageViewerHandle } from '@/components/ImageViewer';
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

const preloadImage = (src: string) => new Promise<void>((resolve) => {
  const img = new Image();

  const finish = () => {
    img.onload = null;
    img.onerror = null;

    if (typeof img.decode === 'function') {
      img.decode().then(() => undefined).catch(() => undefined).finally(resolve);
      return;
    }

    resolve();
  };

  img.onload = finish;
  img.onerror = () => {
    img.onload = null;
    img.onerror = null;
    resolve();
  };
  img.src = src;

  if (img.complete) finish();
});

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
  onBackHandlerReady?: (handler: (() => void) | null) => void;
}

const FADE_MS = 133;
const FLIP_MS = 300;
const FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const Gallery = ({ onInspectChange, onBackHandlerReady }: GalleryProps) => {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [firstReady, setFirstReady] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [othersFaded, setOthersFaded] = useState(false);
  const scrollPosRef = useRef(0);
  const galleryImgRefs = useRef<Map<number, HTMLImageElement>>(new Map());
  const viewerRef = useRef<ImageViewerHandle>(null);
  const fromRectRef = useRef<DOMRect | null>(null);
  const backFromRectRef = useRef<DOMRect | null>(null);
  const currentAnimRef = useRef<Animation | null>(null);

  const clearImageAnimation = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    el.getAnimations().forEach((animation) => animation.cancel());
    el.style.transform = '';
    el.style.transformOrigin = '';
    el.style.opacity = '';
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fallback = window.setTimeout(() => {
      if (!cancelled) setFirstReady(true);
    }, 1500);

    firstImageReadyPromise.finally(() => {
      if (!cancelled) setFirstReady(true);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  const flipAnimate = useCallback((el: HTMLElement, fromRect: DOMRect, toRect: DOMRect) => {
    const dx = fromRect.left - toRect.left;
    const dy = fromRect.top - toRect.top;
    const sx = fromRect.width / toRect.width;
    const sy = fromRect.height / toRect.height;

    if (currentAnimRef.current) {
      currentAnimRef.current.cancel();
    }

    const anim = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, transformOrigin: 'top left' },
        { transform: 'translate(0, 0) scale(1, 1)', transformOrigin: 'top left' },
      ],
      { duration: FLIP_MS, easing: FLIP_EASE, fill: 'both' }
    );
    currentAnimRef.current = anim;
    return anim;
  }, []);

  const handleSelectItem = (item: ItemData) => {
    if (animating) return;
    const galleryImg = galleryImgRefs.current.get(item.id);
    if (!galleryImg) {
      setSelectedId(item.id);
      setSelectedItem(item);
      onInspectChange?.(true);
      return;
    }

    scrollPosRef.current = window.scrollY;
    setSelectedId(item.id);
    setAnimating(true);
    setOthersFaded(true);
    onInspectChange?.(true);

    // After non-clicked items fade out, capture the clicked image rect
    // (it stayed put) and swap to the viewer to perform the FLIP.
    window.setTimeout(() => {
      const stillThere = galleryImgRefs.current.get(item.id);
      fromRectRef.current = (stillThere ?? galleryImg).getBoundingClientRect();
      setSelectedItem(item);
    }, FADE_MS);
  };

  // After viewer mounts, run the FLIP from gallery rect to viewer rect
  useLayoutEffect(() => {
    if (!selectedItem || !animating || !fromRectRef.current) return;
    const viewerImg = viewerRef.current?.getImageEl();
    if (!viewerImg) return;

    let cancelled = false;
    const run = () => {
      const toRect = viewerImg.getBoundingClientRect();
      if (toRect.width === 0 || toRect.height === 0) {
        requestAnimationFrame(run);
        return;
      }
      clearImageAnimation(viewerImg);
      const anim = flipAnimate(viewerImg, fromRectRef.current!, toRect);
      anim.finished.then(() => {
        if (cancelled) return;
        clearImageAnimation(viewerImg);
        setAnimating(false);
        currentAnimRef.current = null;
      }).catch(() => {});
    };
    run();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, clearImageAnimation, flipAnimate, animating]);

  const handleBack = useCallback(async () => {
    if (!selectedItem) return;
    await viewerRef.current?.prepareForReturnToThumbnail();

    const viewerImg = viewerRef.current?.getImageEl();
    if (!viewerImg) {
      setSelectedItem(null);
      setOthersFaded(false);
      onInspectChange?.(false);
      return;
    }

    const fromRect = viewerImg.getBoundingClientRect();

    backFromRectRef.current = fromRect;
    setAnimating(true);
    onInspectChange?.(false);
    setSelectedItem(null);
  }, [selectedItem, flipAnimate, onInspectChange]);

  useLayoutEffect(() => {
    if (selectedItem || !animating || selectedId === null || !backFromRectRef.current) return;

    window.scrollTo(0, scrollPosRef.current);
    const targetImg = galleryImgRefs.current.get(selectedId);

    if (!targetImg) {
      setOthersFaded(false);
      setAnimating(false);
      setSelectedId(null);
      backFromRectRef.current = null;
      return;
    }

    clearImageAnimation(targetImg);
    const anim = flipAnimate(targetImg, backFromRectRef.current, targetImg.getBoundingClientRect());
    setOthersFaded(false);
    anim.finished.then(() => {
      clearImageAnimation(targetImg);
      setAnimating(false);
      setSelectedId(null);
      currentAnimRef.current = null;
      backFromRectRef.current = null;
    }).catch(() => {});
  }, [selectedItem, animating, selectedId, clearImageAnimation, flipAnimate]);

  useEffect(() => {
    if (selectedItem) {
      onBackHandlerReady?.(handleBack);
    } else {
      onBackHandlerReady?.(null);
    }
  }, [selectedItem, handleBack, onBackHandlerReady]);

  // Render: when an item is selected, we show the viewer.
  // When animating-back, viewer is unmounted but gallery shows with others still faded.
  return (
    <>
      {selectedItem ? (
        <ImageViewer ref={viewerRef} image={selectedItem} onBack={handleBack} />
      ) : (
        <div className="bg-background text-foreground font-mono min-h-screen">
          <div className="flex flex-col items-center">
            {ITEMS.map((item, idx) => {
              const isFirst = idx === 0;
              const isSelected = selectedId === item.id;
              const isFading = othersFaded && !isSelected;
              return (
                <div
                  key={item.id}
                  className="h-screen w-full flex items-center justify-center"
                >
                  <img
                    ref={(el) => {
                      if (el) galleryImgRefs.current.set(item.id, el);
                      else galleryImgRefs.current.delete(item.id);
                    }}
                    src={item.main}
                    alt={item.title}
                    loading="eager"
                    decoding="async"
                    fetchPriority={isFirst ? 'high' : 'auto'}
                     className={`max-w-[80vw] max-h-[80vh] object-contain cursor-pointer border border-foreground/20 ${
                       !animating || isSelected ? 'transition-transform duration-300 ease-out hover:scale-105' : ''
                    } ${
                      isFirst && !firstReady ? 'opacity-0' : ''
                    }`}
                    style={{
                      opacity: isFading ? 0 : undefined,
                      transition: isFading
                        ? `opacity ${FADE_MS}ms ease-out`
                        : animating
                          ? `opacity ${FADE_MS}ms ease-out`
                          : undefined,
                    }}
                    onClick={() => handleSelectItem(item)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
