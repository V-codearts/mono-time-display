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
const PLUS_SLIDE_MS = 300;
const PLUS_SLIDE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [incomingVariation, setIncomingVariation] = useState<number | null>(null);
  const [plusY, setPlusY] = useState<number | null>(null);
  const [minusY, setMinusY] = useState<number | null>(null);
  const [plusVisible, setPlusVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const plusVisibleRef = useRef(false);
  const plusExitingRef = useRef(false);
  const plusExitResolversRef = useRef<Array<() => void>>([]);
  const plusExitTimerRef = useRef<number | null>(null);
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

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      const el = getVisibleImageEl();
      if (!el || cancelled || plusExitingRef.current) return;
      const anims = el.getAnimations();
      if (anims.length > 0) {
        Promise.allSettled(anims.map((a) => a.finished)).then(() => {
          if (!cancelled) requestAnimationFrame(measure);
        });
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;
      setPlusY((rect.bottom + window.innerHeight) / 2);
      // Defer visibility so the slide-in transition runs from the off-screen state.
      requestAnimationFrame(() => {
        if (!cancelled && !plusExitingRef.current) setPlusVisible(true);
      });
    };

    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    const img = getVisibleImageEl();
    img?.addEventListener('load', measure);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      img?.removeEventListener('load', measure);
    };
  }, [currentVariation, incomingVariation, image]);

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

  const waitForPlusExit = () => new Promise<void>((resolve) => {
    if (!plusVisibleRef.current) {
      resolve();
      return;
    }
    plusExitingRef.current = true;
    plusExitResolversRef.current.push(resolve);
    setPlusVisible(false);
  });

  useEffect(() => {
    plusVisibleRef.current = plusVisible;
    if (!plusVisible && plusExitResolversRef.current.length > 0) {
      if (plusExitTimerRef.current) window.clearTimeout(plusExitTimerRef.current);
      plusExitTimerRef.current = window.setTimeout(() => {
        const resolvers = plusExitResolversRef.current.splice(0);
        resolvers.forEach((r) => r());
        plusExitTimerRef.current = null;
      }, PLUS_SLIDE_MS);
    }
  }, [plusVisible]);

  useImperativeHandle(ref, () => ({
    getImageEl: () => getVisibleImageEl(),
    getCurrentSrc: () => image.variations[incomingVariation ?? currentVariation],
    prepareForReturnToThumbnail: async () => {
      await waitForSwipeIdle();
      const plusExit = waitForPlusExit();
      if (currentVariationRef.current !== 0) {
        setIncomingVariation(0);
        await waitForSwipeCompletion();
      }
      await plusExit;
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
      <div className="relative flex items-center justify-center w-full max-w-[calc(100vw-96px)] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] h-full max-h-[80vh]">
        <img
          ref={imgRef}
          src={image.variations[currentVariation]}
          alt={`Variation ${currentVariation + 1}`}
          className="max-w-[calc(100vw-96px)] max-h-[80vh] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] object-contain cursor-pointer border border-foreground/20"
          style={{ transition: incomingVariation === null ? 'none' : undefined }}
          onClick={nextVariation}
        />
        {incomingVariation !== null && (
          <img
            ref={incomingImgRef}
            src={image.variations[incomingVariation]}
            alt={`Variation ${incomingVariation + 1}`}
            className="absolute inset-0 m-auto max-w-[calc(100vw-96px)] max-h-[80vh] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] object-contain cursor-pointer border border-foreground/20"
            onClick={nextVariation}
          />
        )}
      </div>
      {/* Preload all variations off-screen so swipes never wait on the network */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 w-px h-px overflow-hidden opacity-0">
        {image.variations.map((src, i) => (
          <img key={i} src={src} alt="" decoding="async" loading="eager" />
        ))}
      </div>
      {plusY !== null && (
        <span
          aria-hidden="true"
          className="fixed left-1/2 text-xl text-foreground select-none cursor-default hover:font-bold"
          style={{
            top: plusY,
            transform: plusVisible
              ? 'translate(-50%, -50%)'
              : `translate(-50%, calc(-50% + ${window.innerHeight - plusY + 40}px))`,
            transition: `transform ${PLUS_SLIDE_MS}ms ${PLUS_SLIDE_EASE}, font-weight 200ms ease-in-out`,
          }}
        >
          +
        </span>
      )}
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
