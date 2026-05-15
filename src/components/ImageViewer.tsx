import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

interface ImageData {
  id: number;
  main: string;
  variations: string[];
  title: string;
  description: string;
  compactMd?: boolean;
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
const ROW_GAP = 26;
const BOTTOM_MARGIN = 26;
const MOBILE_TOP_LIMIT = 81;
const MINUS_OFFSET = 21;
const ROW_STAGGER_MS = 80;
const ROW_SLIDE_MS = 400;
const ROW_OFFSET_PX = 16;
// Overlap so we don't wait for the previous animation to fully finish.
const EXPAND_OVERLAP_MS = 120;   // delay before rows start sliding in
const COLLAPSE_OVERLAP_MS = 320; // delay before minus collapses back
const FADE_OUT_MS = 220;
const DEFAULT_INFO_ROWS = [
  'INFO TEXT',
  'MATERIAL 100%',
  'EXAMPLE COLOR',
  'DIMENSIONS 40 × 60',
  'EDITION 01 / 12',
];

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const INFO_ROWS = (image.description?.trim()
    ? image.description.split('\n').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_INFO_ROWS);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [incomingVariation, setIncomingVariation] = useState<number | null>(null);
  const [plusY, setPlusY] = useState<number | null>(null);
  const [minusY, setMinusY] = useState<number | null>(null);
  const [plusVisible, setPlusVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [rowsVisible, setRowsVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const expandTimerRef = useRef<number | null>(null);
  const ROWS_EXIT_MS = (INFO_ROWS.length - 1) * ROW_STAGGER_MS + ROW_SLIDE_MS;
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
  const layoutTransformRef = useRef<string>('translate3d(0, 0, 0)');

  const getVisibleImageEl = () => incomingImgRef.current ?? imgRef.current;
  const resetImagePosition = (el: HTMLImageElement | null) => {
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform = layoutTransformRef.current;
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
      const isSwiping = incomingVariationRef.current !== null;
      // Don't restart layout transitions during a swipe.
      if (isSwiping) return;
      const anims = el.getAnimations();
      if (anims.length > 0) {
        Promise.allSettled(anims.map((a) => a.finished)).then(() => {
          if (!cancelled) requestAnimationFrame(measure);
        });
        return;
      }

      // Measure natural rect with layout transform cleared.
      const prevTransform = el.style.transform;
      const prevTransition = el.style.transition;
      el.style.transition = 'none';
      el.style.transform = 'translate3d(0, 0, 0)';
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) {
        el.style.transform = prevTransform;
        el.style.transition = prevTransition;
        return;
      }
      // Restore previous transform (no transition) so the upcoming animation
      // starts from the current visual state instead of jumping to natural size.
      el.style.transform = prevTransform || 'translate3d(0, 0, 0)';
      void el.offsetWidth;

      const isMobile = window.innerWidth < 768;
      const N = INFO_ROWS.length;
      const requiredBottom =
        window.innerHeight - BOTTOM_MARGIN - (N - 1) * ROW_GAP - ROW_GAP - MINUS_OFFSET;

      let shift = 0;
      let scale = 1;
      let finalBottom = rect.bottom;

      if (expanded && rect.bottom > requiredBottom) {
        const delta = rect.bottom - requiredBottom;
        if (isMobile) {
          const maxShift = Math.max(0, rect.top - MOBILE_TOP_LIMIT);
          shift = Math.min(delta, maxShift);
          const finalTop = rect.top - shift;
          finalBottom = rect.bottom - shift;
          if (shift < delta) {
            const targetH = requiredBottom - finalTop;
            scale = Math.max(0.05, targetH / rect.height);
            finalBottom = finalTop + rect.height * scale;
          }
        } else {
          const targetH = requiredBottom - rect.top;
          scale = Math.max(0.05, targetH / rect.height);
          finalBottom = rect.top + rect.height * scale;
        }
      }

      const nextTransform = `translate3d(0, ${-shift}px, 0) scale(${scale})`;
      layoutTransformRef.current = nextTransform;
      el.style.transformOrigin = '50% 0%';
      requestAnimationFrame(() => {
        if (cancelled) return;
        el.style.transition = `transform ${PLUS_SLIDE_MS}ms ${PLUS_SLIDE_EASE}`;
        el.style.transform = nextTransform;
      });

      setPlusY((finalBottom + window.innerHeight) / 2);
      setMinusY(finalBottom + MINUS_OFFSET);
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
  }, [currentVariation, image, expanded]);

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
      let exit: Promise<void>;
      if (expanded) {
        // Just fade everything out — no slide choreography on return.
        setFadingOut(true);
        exit = new Promise<void>((resolve) => window.setTimeout(resolve, FADE_OUT_MS));
      } else {
        exit = waitForPlusExit();
      }
      if (currentVariationRef.current !== 0) {
        setIncomingVariation(0);
        await waitForSwipeCompletion();
      }
      await exit;
    },
  }), [image, currentVariation, incomingVariation, expanded]);

  useLayoutEffect(() => {
    if (incomingVariation === null || !imgRef.current || !incomingImgRef.current) return;

    const currentImg = imgRef.current;
    const nextImg = incomingImgRef.current;
    const layout = layoutTransformRef.current;

    // Apply layout transform to incoming image so it matches current scale/shift.
    nextImg.style.transformOrigin = '50% 0%';
    nextImg.style.transition = 'none';
    nextImg.style.transform = layout;
    void nextImg.offsetWidth;

    const currentRect = currentImg.getBoundingClientRect();
    const nextRect = nextImg.getBoundingClientRect();
    const vw = window.innerWidth;
    const outgoingExitX = vw - currentRect.left;
    const incomingStartX = -(nextRect.left + nextRect.width);

    currentImg.style.transition = 'none';
    currentImg.style.transform = `translateX(0px) ${layout}`;
    currentImg.style.opacity = '1';
    nextImg.style.transform = `translateX(${incomingStartX}px) ${layout}`;
    nextImg.style.opacity = '1';

    const frame = requestAnimationFrame(() => {
      currentImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      nextImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}`;
      currentImg.style.transform = `translateX(${outgoingExitX}px) ${layout}`;
      nextImg.style.transform = `translateX(0px) ${layout}`;
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

  const mdSize = image.compactMd
    ? 'md:max-w-[40vw] md:max-h-[32vh] lg:max-w-[24vw] lg:max-h-[24vh]'
    : 'md:max-w-[calc(100vw-120px)] lg:max-w-[80vw]';
  const wrapperMdSize = image.compactMd
    ? 'md:max-w-[40vw] md:max-h-[32vh] lg:max-w-[24vw] lg:max-h-[24vh]'
    : 'md:max-w-[calc(100vw-120px)] lg:max-w-[80vw]';

  return (
    <div className="text-foreground font-mono min-h-screen h-screen overflow-hidden flex items-center justify-center p-8">
      <div className={`relative flex items-center justify-center w-full max-w-[calc(100vw-96px)] ${wrapperMdSize} h-full max-h-[80vh]`}>
        <img
          ref={imgRef}
          src={image.variations[currentVariation]}
          alt={`Variation ${currentVariation + 1}`}
          className={`max-w-[calc(100vw-96px)] max-h-[80vh] ${mdSize} object-contain cursor-pointer`}
          style={{ transition: incomingVariation === null ? 'none' : undefined }}
          onClick={nextVariation}
        />
        {incomingVariation !== null && (
          <img
            ref={incomingImgRef}
            src={image.variations[incomingVariation]}
            alt={`Variation ${incomingVariation + 1}`}
            className={`absolute inset-0 m-auto max-w-[calc(100vw-96px)] max-h-[80vh] ${mdSize} object-contain cursor-pointer`}
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
      {plusY !== null && minusY !== null && (
        <>
          <span
            className="fixed left-1/2 top-0 text-xl text-foreground select-none cursor-pointer hover:font-bold"
            style={{
              transform: plusVisible
                ? `translate(-50%, -50%) translateY(${expanded ? minusY : plusY}px)`
                : `translate(-50%, -50%) translateY(${window.innerHeight + 40}px)`,
              opacity: fadingOut ? 0 : 1,
              transition: fadingOut
                ? `opacity ${FADE_OUT_MS}ms ease-out`
                : `transform ${PLUS_SLIDE_MS}ms ${PLUS_SLIDE_EASE}, font-weight 200ms ease-in-out`,
            }}
            onClick={() => {
              if (expandTimerRef.current) {
                window.clearTimeout(expandTimerRef.current);
                expandTimerRef.current = null;
              }
              if (expanded) {
                // Collapsing: rows start sliding out; minus follows shortly after.
                setRowsVisible(false);
                expandTimerRef.current = window.setTimeout(() => {
                  setExpanded(false);
                  expandTimerRef.current = null;
                }, COLLAPSE_OVERLAP_MS);
              } else {
                // Expanding: minus starts sliding up; rows follow shortly after.
                setExpanded(true);
                expandTimerRef.current = window.setTimeout(() => {
                  setRowsVisible(true);
                  expandTimerRef.current = null;
                }, EXPAND_OVERLAP_MS);
              }
            }}
          >
            <span
              className="transition-opacity"
              style={{ opacity: expanded ? 0 : 1, transitionDuration: '180ms' }}
            >
              +
            </span>
            <span
              className="absolute left-0 top-0 transition-opacity"
              style={{ opacity: expanded ? 1 : 0, transitionDuration: '180ms' }}
            >
              −
            </span>
          </span>
          {INFO_ROWS.map((row, i) => {
            const showing = rowsVisible && plusVisible;
            const targetY = minusY + ROW_GAP * (i + 1);
            const hiddenY = window.innerHeight + 80;
            return (
              <span
                key={i}
                className="fixed left-1/2 top-0 uppercase tracking-wider text-foreground select-none pointer-events-none whitespace-nowrap"
                style={{
                  transform: `translate(-50%, -50%) translateY(${
                    fadingOut ? targetY : showing ? targetY : hiddenY
                  }px)`,
                  opacity: fadingOut ? 0 : 1,
                  transition: fadingOut
                    ? `opacity ${FADE_OUT_MS}ms ease-out`
                    : `transform ${ROW_SLIDE_MS}ms ${PLUS_SLIDE_EASE}`,
                  transitionDelay: fadingOut
                    ? '0ms'
                    : `${(showing ? i : INFO_ROWS.length - 1 - i) * ROW_STAGGER_MS}ms`,
                }}
              >
                {row}
              </span>
            );
          })}
        </>
      )}
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
