import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

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
  prepareForReturnToThumbnail: () => Promise<void>;
}

const SWIPE_MS = 270;
// Near-linear with the faintest hint of easing.
const SWIPE_EASE = 'cubic-bezier(0.45, 0.5, 0.55, 0.5)';

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [incomingVariation, setIncomingVariation] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const incomingImgRef = useRef<HTMLImageElement>(null);
  const swipeTimeoutRef = useRef<number | null>(null);
  const currentVariationRef = useRef(0);
  const incomingVariationRef = useRef<number | null>(null);
  const swipeIdleResolversRef = useRef<Array<() => void>>([]);
  const swipeCompletionResolversRef = useRef<Array<() => void>>([]);

  const getVisibleImageEl = () => incomingImgRef.current ?? imgRef.current;
  const resetImagePosition = (el: HTMLImageElement | null) => {
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform = 'translate3d(0, 0, 0)';
    el.style.opacity = '1';
  };

  useEffect(() => {
    currentVariationRef.current = currentVariation;
  }, [currentVariation]);

  useEffect(() => {
    incomingVariationRef.current = incomingVariation;

    if (incomingVariation === null && swipeIdleResolversRef.current.length > 0) {
      const resolvers = swipeIdleResolversRef.current.splice(0);
      resolvers.forEach((resolve) => resolve());
    }
  }, [incomingVariation]);

  const waitForSwipeIdle = () => new Promise<void>((resolve) => {
    if (incomingVariationRef.current === null) {
      resolve();
      return;
    }

    swipeIdleResolversRef.current.push(resolve);
  });

  const waitForSwipeCompletion = () => new Promise<void>((resolve) => {
    swipeCompletionResolversRef.current.push(resolve);
  });

  useImperativeHandle(ref, () => ({
    getImageEl: () => getVisibleImageEl(),
    getCurrentSrc: () => image.variations[incomingVariation ?? currentVariation],
    prepareForReturnToThumbnail: async () => {
      await waitForSwipeIdle();

      if (currentVariationRef.current === 0) return;

      setIncomingVariation(0);
      await waitForSwipeCompletion();
    },
  }), [image, currentVariation, incomingVariation]);

  useLayoutEffect(() => {
    if (incomingVariation === null || !imgRef.current || !incomingImgRef.current) return;

    const currentImg = imgRef.current;
    const nextImg = incomingImgRef.current;

    // Measure actual rendered position so each image fully clears the viewport.
    const currentRect = currentImg.getBoundingClientRect();
    const nextRect = nextImg.getBoundingClientRect();
    const vw = window.innerWidth;
    const outgoingExitX = vw - currentRect.left; // move right until fully off-screen
    const incomingStartX = -(nextRect.left + nextRect.width); // start fully off-screen left

    currentImg.style.transition = 'none';
    nextImg.style.transition = 'none';
    currentImg.style.transform = 'translate3d(0, 0, 0)';
    currentImg.style.opacity = '1';
    nextImg.style.transform = `translate3d(${incomingStartX}px, 0, 0)`;
    nextImg.style.opacity = '1';

    const frame = requestAnimationFrame(() => {
      currentImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      nextImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      currentImg.style.transform = `translate3d(${outgoingExitX}px, 0, 0)`;
      nextImg.style.transform = 'translate3d(0, 0, 0)';
    });

    swipeTimeoutRef.current = window.setTimeout(() => {
      resetImagePosition(currentImg);
      resetImagePosition(nextImg);
      setCurrentVariation(incomingVariation);
      setIncomingVariation(null);
      if (swipeCompletionResolversRef.current.length > 0) {
        const resolvers = swipeCompletionResolversRef.current.splice(0);
        resolvers.forEach((resolve) => resolve());
      }
      swipeTimeoutRef.current = null;
    }, SWIPE_MS);

    return () => {
      cancelAnimationFrame(frame);
      if (swipeTimeoutRef.current) {
        window.clearTimeout(swipeTimeoutRef.current);
        swipeTimeoutRef.current = null;
      }
    };
  }, [incomingVariation]);

  const nextVariation = () => {
    if (incomingVariation !== null) return;
    setIncomingVariation((currentVariation + 1) % image.variations.length);
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen flex items-center justify-center p-8">
      <div className="relative flex items-center justify-center w-full max-w-[80vw] h-full max-h-[80vh]">
        <img
          ref={imgRef}
          src={image.variations[currentVariation]}
          alt={`Variation ${currentVariation + 1}`}
          className="max-w-[80vw] max-h-[80vh] object-contain cursor-pointer border border-foreground/20"
          style={{ transition: incomingVariation === null ? 'none' : undefined }}
          onClick={nextVariation}
        />
        {incomingVariation !== null && (
          <img
            ref={incomingImgRef}
            src={image.variations[incomingVariation]}
            alt={`Variation ${incomingVariation + 1}`}
            className="absolute inset-0 m-auto max-w-[80vw] max-h-[80vh] object-contain cursor-pointer border border-foreground/20"
            onClick={nextVariation}
          />
        )}
      </div>
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
