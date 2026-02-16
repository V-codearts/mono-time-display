import { useState } from 'react';
import ImageViewer from './ImageViewer';

interface GalleryProps {
  onBack?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Gallery = ({ isDarkMode, onToggleTheme }: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Placeholder images data
  const images = [
    {
      id: 1,
      main: "/api/placeholder/800/800",
      variations: ["/api/placeholder/800/800", "/api/placeholder/800/801", "/api/placeholder/800/802"],
      description: "A stunning landscape captured during golden hour, showcasing the natural beauty of untouched wilderness."
    },
    {
      id: 2,
      main: "/api/placeholder/801/800",
      variations: ["/api/placeholder/801/800", "/api/placeholder/801/801", "/api/placeholder/801/802"],
      description: "Urban architecture meets modern design in this captivating cityscape photograph."
    },
    {
      id: 3,
      main: "/api/placeholder/802/800",
      variations: ["/api/placeholder/802/800", "/api/placeholder/802/801", "/api/placeholder/802/802"],
      description: "Intimate portrait work that captures the essence and emotion of the subject."
    },
    {
      id: 4,
      main: "/api/placeholder/803/800",
      variations: ["/api/placeholder/803/800", "/api/placeholder/803/801", "/api/placeholder/803/802"],
      description: "Abstract composition exploring form, color, and movement in contemporary art."
    },
    {
      id: 5,
      main: "/api/placeholder/804/800",
      variations: ["/api/placeholder/804/800", "/api/placeholder/804/801", "/api/placeholder/804/802"],
      description: "Nature's intricate patterns revealed through macro photography techniques."
    }
  ];

  if (selectedImage !== null) {
    const imageData = images.find(img => img.id === selectedImage);
    if (imageData) {
      return (
        <ImageViewer
          image={imageData}
          onBack={() => setSelectedImage(null)}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />
      );
    }
  }

  return (
    <div className="bg-background text-foreground font-mono min-h-screen">
      {/* Theme Toggle Dot */}
      <div 
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onToggleTheme}
      />

      {/* Gallery Grid */}
      <div className="flex flex-col items-center justify-start min-h-screen py-20">
        {images.map((image) => (
          <div 
            key={image.id}
            className="w-full flex items-center justify-center h-screen cursor-pointer"
            onClick={() => setSelectedImage(image.id)}
          >
            <img 
              src={image.main}
              alt={`Gallery item ${image.id}`}
              className="w-[80vmin] h-[80vmin] object-cover border border-foreground/20 hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;