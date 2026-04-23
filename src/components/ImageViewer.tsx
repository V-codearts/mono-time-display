import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

interface ImageData {
  id: number;
  main: string;
  variations: string[];
  title: string;
  description: string;
}

interface ImageViewerProps {
  image: ImageData;
  onBack: () => void;
}

export interface ImageViewerHandle {
  getImageEl: () => HTMLImageElement | null;
  getCurrentSrc: () => string;
  getCurrentVariation: () => number;
  swipeToVariation: (targetVariation: number, direction?: 'forward' | 'backward') => Promise<void>;
}

const SWIPE_MS = 180;
const SWIPE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [incomingVariation, setIncomingVariation] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'forward' | 'backward'>('forward');
  const imgRef = useRef<HTMLImageElement>(null);
  const incomingImgRef = useRef<HTMLImageElement>(null);
  const swipeTimeoutRef = useRef<number | null>(null);
  const pendingTargetRef = useRef<number | null>(null);
  const swipeResolverRef = useRef<(() => void) | null>(null);

  const startSwipe = useCallback((targetVariation: number, direction: 'forward' | 'backward' = 'forward') => {
    if (incomingVariation !== null || targetVariation === currentVariation) {
      return Promise.resolve();
    }

    pendingTargetRef.current = targetVariation;
    setSwipeDirection(direction);
    setIncomingVariation(targetVariation);

    return new Promise<void>((resolve) => {
      swipeResolverRef.current = resolve;
    });
  }, [currentVariation, incomingVariation]);

  useImperativeHandle(ref, () => ({
    getImageEl: () => imgRef.current,
    getCurrentSrc: () => image.variations[currentVariation],
    getCurrentVariation: () => currentVariation,
    swipeToVariation: (targetVariation, direction = 'forward') => startSwipe(targetVariation, direction),
  }), [currentVariation, image, startSwipe]);

  useLayoutEffect(() => {
    if (incomingVariation === null || !imgRef.current || !incomingImgRef.current) return;

    const currentImg = imgRef.current;
    const nextImg = incomingImgRef.current;

    const exitX = swipeDirection === 'forward' ? '110%' : '-110%';
    const enterX = swipeDirection === 'forward' ? '-110%' : '110%';

    currentImg.style.transition = 'none';
    nextImg.style.transition = 'none';
    currentImg.style.transform = 'translate3d(0, 0, 0)';
    nextImg.style.transform = `translate3d(${enterX}, 0, 0)`;

    const frame = requestAnimationFrame(() => {
      currentImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      nextImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      currentImg.style.transform = `translate3d(${exitX}, 0, 0)`;
      nextImg.style.transform = 'translate3d(0, 0, 0)';
    });

    swipeTimeoutRef.current = window.setTimeout(() => {
      const nextVariation = pendingTargetRef.current ?? incomingVariation;
      setCurrentVariation(nextVariation);
      setIncomingVariation(null);
      pendingTargetRef.current = null;
      swipeTimeoutRef.current = null;
      swipeResolverRef.current?.();
      swipeResolverRef.current = null;
    }, SWIPE_MS);

    return () => {
      cancelAnimationFrame(frame);
      if (swipeTimeoutRef.current) {
        window.clearTimeout(swipeTimeoutRef.current);
        swipeTimeoutRef.current = null;
      }
    };
  }, [incomingVariation, swipeDirection]);

  const nextVariation = () => {
    void startSwipe((currentVariation + 1) % image.variations.length, 'forward');
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen flex items-center justify-center p-8">
      <div className="relative h-[80vh] w-[80vw] overflow-hidden">
        <img
          ref={imgRef}
          src={image.variations[currentVariation]}
          alt={`Variation ${currentVariation + 1}`}
          className="absolute inset-0 m-auto max-w-full max-h-full object-contain cursor-pointer border border-foreground/20"
          style={{ transform: 'translate3d(0, 0, 0)' }}
          onClick={nextVariation}
        />
        {incomingVariation !== null && (
          <img
            ref={incomingImgRef}
            src={image.variations[incomingVariation]}
            alt={`Variation ${incomingVariation + 1}`}
            className="absolute inset-0 m-auto max-w-full max-h-full object-contain cursor-pointer border border-foreground/20"
            onClick={nextVariation}
          />
        )}
      </div>
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
