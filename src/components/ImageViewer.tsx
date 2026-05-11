import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

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
const SWIPE_EASE = 'cubic-bezier(0.45, 0.5, 0.55, 0.5)';

const LOREM = 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA.';

const TEXT_BOTTOM_MARGIN = 35;
const IMAGE_TO_TOGGLE_CENTER = 25;
const TOGGLE_CENTER_TO_TEXT = 25;
const MOBILE_EXPANDED_MIN_TOP = 73;
const LAYOUT_TRANSITION_MS = 260;
const LAYOUT_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const getImageBounds = (vw: number, vh: number) => {
  const maxWidth = vw >= 1024 ? vw * 0.8 : vw - (vw >= 768 ? 120 : 96);
  return {
    maxWidth: Math.max(1, maxWidth),
    maxHeight: vh * 0.8,
  };
};

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [incomingVariation, setIncomingVariation] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [textHeight, setTextHeight] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const incomingImgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => { currentVariationRef.current = currentVariation; }, [currentVariation]);

  useEffect(() => {
    incomingVariationRef.current = incomingVariation;
    if (incomingVariation === null && swipeIdleResolversRef.current.length > 0) {
      const resolvers = swipeIdleResolversRef.current.splice(0);
      resolvers.forEach((resolve) => resolve());
    }
  }, [incomingVariation]);

  const waitForSwipeIdle = () => new Promise<void>((resolve) => {
    if (incomingVariationRef.current === null) { resolve(); return; }
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
    const currentRect = currentImg.getBoundingClientRect();
    const nextRect = nextImg.getBoundingClientRect();
    const vw = window.innerWidth;
    const outgoingExitX = vw - currentRect.left;
    const incomingStartX = -(nextRect.left + nextRect.width);

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

  const recompute = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const winH = window.innerHeight;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    if (!expanded) {
      // Natural state — capture rect.
      const r = img.getBoundingClientRect();
      // Account for any leftover translateY (shouldn't be any when collapsed, but be safe).
      naturalRectRef.current = { top: r.top, bottom: r.bottom, height: r.height };
      setImgMaxH(null);
      setImgTranslateY(0);
      setBtnCenterY((r.bottom + winH) / 2);
      setTextTopY(null);
      return;
    }

    const nat = naturalRectRef.current;
    const textEl = textRef.current;
    if (!nat || !textEl) return;
    const textH = textEl.offsetHeight;

    const maxImgBottom = winH - BOTTOM_MARGIN - textH - MINUS_GAP - MINUS_TO_TEXT;

    let newImgBottom = nat.bottom;
    let translateY = 0;
    let maxH: number | null = null;

    if (nat.bottom <= maxImgBottom) {
      // Fits naturally.
    } else if (isDesktop) {
      // Shrink; top stays.
      const newHeight = Math.max(50, maxImgBottom - nat.top);
      maxH = newHeight;
      newImgBottom = nat.top + newHeight;
    } else {
      const shiftNeeded = nat.bottom - maxImgBottom;
      const maxShift = Math.max(0, nat.top - MOBILE_TOP_MIN);
      if (shiftNeeded <= maxShift) {
        translateY = -shiftNeeded;
        newImgBottom = maxImgBottom;
      } else {
        translateY = -maxShift;
        const newHeight = Math.max(50, maxImgBottom - MOBILE_TOP_MIN);
        maxH = newHeight;
        newImgBottom = MOBILE_TOP_MIN + newHeight;
      }
    }

    setImgMaxH(maxH);
    setImgTranslateY(translateY);
    setBtnCenterY(newImgBottom + MINUS_GAP);
    setTextTopY(newImgBottom + MINUS_GAP + MINUS_TO_TEXT);
  }, [expanded]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute, currentVariation, image.id]);

  useEffect(() => {
    const onResize = () => recompute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [recompute]);

  // Re-capture natural rect once the image has loaded.
  const handleImgLoad = () => {
    if (!expanded) recompute();
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen relative overflow-hidden">
      <div
        ref={wrapperRef}
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{
          transform: `translate(-50%, calc(-50% + ${imgTranslateY}px))`,
          transition: `transform ${LAYOUT_TRANSITION_MS}ms ${LAYOUT_EASE}`,
        }}
      >
        <div className="relative">
          <img
            ref={imgRef}
            src={image.variations[currentVariation]}
            alt={`Variation ${currentVariation + 1}`}
            onLoad={handleImgLoad}
            className="max-w-[calc(100vw-96px)] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] object-contain cursor-pointer border border-foreground/20"
            style={{
              maxHeight: imgMaxH !== null ? `${imgMaxH}px` : '80vh',
              transition: `max-height ${LAYOUT_TRANSITION_MS}ms ${LAYOUT_EASE}`,
            }}
            onClick={nextVariation}
          />
          {incomingVariation !== null && (
            <img
              ref={incomingImgRef}
              src={image.variations[incomingVariation]}
              alt={`Variation ${incomingVariation + 1}`}
              className="absolute inset-0 m-auto max-w-[calc(100vw-96px)] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] object-contain cursor-pointer border border-foreground/20"
              style={{ maxHeight: imgMaxH !== null ? `${imgMaxH}px` : '80vh' }}
              onClick={nextVariation}
            />
          )}
        </div>
      </div>

      {/* +/- toggle */}
      <button
        type="button"
        aria-label={expanded ? 'Collapse info' : 'Expand info'}
        onClick={() => setExpanded((v) => !v)}
        className="absolute left-1/2 z-20 text-xl leading-none select-none text-foreground cursor-pointer"
        style={{
          top: btnCenterY !== null ? `${btnCenterY}px` : '50%',
          transform: 'translate(-50%, -50%)',
          transition: `top ${LAYOUT_TRANSITION_MS}ms ${LAYOUT_EASE}`,
          opacity: btnCenterY !== null ? 1 : 0,
        }}
      >
        {expanded ? '−' : '+'}
      </button>

      {/* Description text */}
      <div
        ref={textRef}
        aria-hidden={!expanded}
        className="absolute left-1/2 z-10 text-xs leading-relaxed text-center pointer-events-none"
        style={{
          top: textTopY !== null ? `${textTopY}px` : '100%',
          transform: 'translateX(-50%)',
          maxWidth: 'min(80vw, 640px)',
          opacity: expanded ? 1 : 0,
          transition: `opacity ${LAYOUT_TRANSITION_MS}ms ${LAYOUT_EASE}, top ${LAYOUT_TRANSITION_MS}ms ${LAYOUT_EASE}`,
        }}
      >
        {LOREM}
      </div>

      {/* Preload all variations off-screen so swipes never wait on the network */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 w-px h-px overflow-hidden opacity-0">
        {image.variations.map((src, i) => (
          <img key={i} src={src} alt="" decoding="async" loading="eager" />
        ))}
      </div>
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
