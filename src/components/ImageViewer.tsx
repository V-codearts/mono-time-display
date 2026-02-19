import { useState } from 'react';

interface ImageData {
  id: number;
  main: string;
  variations: string[];
  description: string;
}

interface ImageViewerProps {
  image: ImageData;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const ImageViewer = ({ image, onBack, isDarkMode, onToggleTheme }: ImageViewerProps) => {
  const [currentVariation, setCurrentVariation] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const nextVariation = () => {
    setCurrentVariation((prev) => (prev + 1) % image.variations.length);
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen flex flex-col">
      {/* Back Button */}
      <div 
        className="fixed top-[9px] md:top-[15px] left-[18px] md:left-[24px] text-xl font-normal cursor-pointer hover:font-bold transition-all duration-200 z-50"
        onClick={onBack}
      >
        &lt;
      </div>

      {/* Theme Toggle Dot */}
      <div 
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onToggleTheme}
      />

      {/* Image Viewer */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Main Image */}
        <img 
          src={image.variations[currentVariation]}
          alt={`Variation ${currentVariation + 1}`}
          className="max-w-[90vw] max-h-[70vh] object-contain cursor-pointer border border-foreground/20"
          style={{ transition: 'none' }}
          onClick={nextVariation}
        />

        {/* Description Toggle */}
        <div className="flex flex-col items-center" style={{ marginTop: '-12px' }}>
          <button
            onClick={toggleDescription}
            className="text-xl cursor-pointer transition-all duration-200 hover:font-bold"
          >
            {showDescription ? '−' : '+'}
          </button>
          
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showDescription ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ marginTop: showDescription ? '-16px' : '0px' }}
          >
            <div className="max-w-2xl text-center leading-tight uppercase">
              {image.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;