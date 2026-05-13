import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

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
const MOBILE_TOP_LIMIT = 81;

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [incomingVariation, setIncomingVariation] = useState<number | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [layout, setLayout] = useState<{ top: number; maxHeight: number; lh: number; imgBottom: number } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const incomingImgRef = useRef<HTMLImageElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const swipeTimeoutRef = useRef<number | null>(null);
  const currentVariationRef = useRef(0);
  const incomingVariationRef = useRef<number | null>(null);
  const swipeIdleResolversRef = useRef<Array<() => void>>([]);
  const swipeCompletionResolversRef = useRef<Array<() => void>>([]);

  const isMobile = useIsMobile();

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

  // --- Layout computation ----------------------------------------------------
  const computeLayout = () => {
    const lhEl = measureRef.current;
    if (!lhEl) return;
    const LH = lhEl.getBoundingClientRect().height || 24;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Horizontal max-width matches the existing HUD-symmetric rule.
    let maxW: number;
    if (vw >= 1024) maxW = vw * 0.8;
    else if (vw >= 768) maxW = vw - 120;
    else maxW = vw - 96;

    // Natural max-height (when no info shown) = 80vh, centered.
    const naturalMaxH = vh * 0.8;
    const naturalTop = (vh - naturalMaxH) / 2;

    const rows = image.description ? image.description.split('\n').length : 0;
    // infoH = LH (gap above −) + LH (the −) + rows*LH + (rows-1)*LH gaps between rows.
    const infoH = infoOpen && rows > 0 ? LH + LH + rows * LH + Math.max(0, rows - 1) * LH : 0;

    let top = naturalTop;
    let maxHeight = naturalMaxH;

    if (infoH > 0) {
      const available = vh - top - infoH;
      if (available < naturalMaxH) {
        if (isMobile) {
          // Try sliding up first (only as much as needed), capped at MOBILE_TOP_LIMIT.
          const overflow = naturalMaxH - available;
          const slideRoom = top - MOBILE_TOP_LIMIT;
          const slide = Math.min(overflow, Math.max(0, slideRoom));
          top -= slide;
          const remaining = vh - top - infoH;
          maxHeight = Math.min(naturalMaxH, remaining);
        } else {
          maxHeight = Math.max(0, available);
        }
      }
    }

    // Determine the actual rendered image bottom: image height is min(maxHeight, naturalRendered).
    // We don't know intrinsic AR-fit easily; the glyph below uses the image element rect at paint time.
    setLayout({ top, maxHeight, lh: LH, imgBottom: top + maxHeight });
  };

  useLayoutEffect(() => {
    computeLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoOpen, image, isMobile]);

  useEffect(() => {
    const onResize = () => computeLayout();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoOpen, image, isMobile]);

  // After image renders/loads, recompute imgBottom from the actual rect (object-contain may letterbox).
  const refreshImgBottom = () => {
    const el = imgRef.current;
    if (!el || !layout) return;
    const r = el.getBoundingClientRect();
    if (Math.abs(r.bottom - layout.imgBottom) > 0.5) {
      setLayout({ ...layout, imgBottom: r.bottom });
    }
  };

  // --- Swipe animation (unchanged behavior) ---------------------------------
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

  const top = layout?.top ?? 0;
  const maxHeight = layout?.maxHeight ?? 0;
  const lh = layout?.lh ?? 24;
  const imgBottom = layout?.imgBottom ?? 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  const glyphTop = infoOpen ? imgBottom + lh : (imgBottom + vh) / 2;

  const rows = image.description ? image.description.split('\n') : [];

  return (
    <div className="bg-background text-foreground font-mono min-h-screen relative overflow-hidden">
      {/* Hidden line-height measurement */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none text-base leading-normal"
        style={{ top: -9999, left: -9999 }}
      >
        M
      </span>

      {/* Image */}
      <img
        ref={imgRef}
        src={image.variations[currentVariation]}
        alt={`Variation ${currentVariation + 1}`}
        onLoad={refreshImgBottom}
        className="absolute left-1/2 -translate-x-1/2 max-w-[calc(100vw-96px)] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] object-contain cursor-pointer border border-foreground/20"
        style={{
          top: layout ? `${top}px` : undefined,
          maxHeight: layout ? `${maxHeight}px` : undefined,
          visibility: layout ? 'visible' : 'hidden',
          transition: incomingVariation === null ? 'none' : undefined,
        }}
        onClick={nextVariation}
      />
      {incomingVariation !== null && (
        <img
          ref={incomingImgRef}
          src={image.variations[incomingVariation]}
          alt={`Variation ${incomingVariation + 1}`}
          className="absolute left-1/2 -translate-x-1/2 max-w-[calc(100vw-96px)] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] object-contain cursor-pointer border border-foreground/20"
          style={{
            top: layout ? `${top}px` : undefined,
            maxHeight: layout ? `${maxHeight}px` : undefined,
          }}
          onClick={nextVariation}
        />
      )}

      {/* Inspect-only +/− glyph */}
      {layout && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-xl cursor-pointer select-none uppercase tracking-wider"
          style={{ top: `${glyphTop}px`, transform: 'translate(-50%, -50%)' }}
          onClick={() => setInfoOpen((v) => !v)}
        >
          {infoOpen ? '−' : '+'}
        </div>
      )}

      {/* Info text rows */}
      {layout && infoOpen && rows.length > 0 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center uppercase tracking-wider text-foreground"
          style={{ top: `${imgBottom + lh + lh + lh}px` }}
        >
          {rows.map((row, i) => (
            <div key={i} style={{ marginTop: i === 0 ? 0 : `${lh}px`, lineHeight: `${lh}px` }}>
              {row}
            </div>
          ))}
        </div>
      )}

      {/* Preload all variations */}
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
