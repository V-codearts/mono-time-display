import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

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

const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ image }, ref) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({
    getImageEl: () => imgRef.current,
    getCurrentSrc: () => image.variations[currentVariation],
  }), [image, currentVariation]);

  const nextVariation = () => {
    setCurrentVariation((prev) => (prev + 1) % image.variations.length);
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen flex items-center justify-center p-8">
      <div className="flex items-center justify-center">
        <img 
          ref={imgRef}
          src={image.variations[currentVariation]}
          alt={`Variation ${currentVariation + 1}`}
          className="max-w-[80vw] max-h-[80vh] object-contain cursor-pointer border border-foreground/20"
          style={{ transition: 'none' }}
          onClick={nextVariation}
        />
      </div>
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
