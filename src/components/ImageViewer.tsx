import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

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
}

const SWIPE_MS = 180;
const SWIPE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [incomingVariation, setIncomingVariation] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const incomingImgRef = useRef<HTMLImageElement>(null);
  const swipeTimeoutRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    getImageEl: () => imgRef.current,
    getCurrentSrc: () => image.variations[currentVariation],
  }), [image, currentVariation]);

  useLayoutEffect(() => {
    if (incomingVariation === null || !imgRef.current || !incomingImgRef.current) return;

    const currentImg = imgRef.current;
    const nextImg = incomingImgRef.current;

    currentImg.style.transition = 'none';
    nextImg.style.transition = 'none';
    currentImg.style.transform = 'translate3d(0, 0, 0)';
    currentImg.style.opacity = '1';
    nextImg.style.transform = 'translate3d(-7%, 0, 0)';
    nextImg.style.opacity = '0';

    const frame = requestAnimationFrame(() => {
      currentImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}, opacity ${SWIPE_MS}ms ease-out`;
      nextImg.style.transition = `transform ${SWIPE_MS}ms ${SWIPE_EASE}, opacity ${SWIPE_MS}ms ease-out`;
      currentImg.style.transform = 'translate3d(7%, 0, 0)';
      currentImg.style.opacity = '0';
      nextImg.style.transform = 'translate3d(0, 0, 0)';
      nextImg.style.opacity = '1';
    });

    swipeTimeoutRef.current = window.setTimeout(() => {
      setCurrentVariation(incomingVariation);
      setIncomingVariation(null);
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
