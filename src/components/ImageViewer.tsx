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
  const [showDescription, setShowDescription] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({
    getImageEl: () => imgRef.current,
    getCurrentSrc: () => image.variations[currentVariation],
  }), [image, currentVariation]);

  const nextVariation = () => {
    setCurrentVariation((prev) => (prev + 1) % image.variations.length);
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen flex flex-col">
      {/* Image Viewer */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Main Image */}
        <img 
          ref={imgRef}
          src={image.variations[currentVariation]}
          alt={`Variation ${currentVariation + 1}`}
          className="max-w-[90vw] max-h-[70vh] object-contain cursor-pointer border border-foreground/20"
          style={{ transition: 'none' }}
          onClick={nextVariation}
        />

        {/* Description Toggle */}
        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={toggleDescription}
            className="text-xl cursor-pointer transition-all duration-200 hover:font-bold"
          >
            {showDescription ? '−' : '+'}
          </button>
          
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showDescription ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}
          >
          <div className="max-w-2xl text-center leading-relaxed uppercase whitespace-pre-line">
            <div>{image.title}</div>
            {image.description && <div style={{ marginTop: 'calc(0.5rem - 10px)' }}>{image.description}</div>}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
