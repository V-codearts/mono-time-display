import { useState } from 'react';
import ImageViewer from './ImageViewer';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';

interface GalleryProps {
  onBack?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate?: (page: string) => void;
}

const Gallery = ({ isDarkMode, onToggleTheme, onNavigate }: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const images = [
    {
      id: 1,
      main: gallery1,
      variations: [gallery1, gallery2, gallery3],
      description: "A stunning landscape captured during golden hour, showcasing the natural beauty of untouched wilderness."
    },
    {
      id: 2,
      main: gallery2,
      variations: [gallery2, gallery4, gallery5],
      description: "Urban architecture meets modern design in this captivating cityscape photograph."
    },
    {
      id: 3,
      main: gallery3,
      variations: [gallery3, gallery1, gallery4],
      description: "Intimate portrait work that captures the essence and emotion of the subject."
    },
    {
      id: 4,
      main: gallery4,
      variations: [gallery4, gallery5, gallery2],
      description: "Abstract composition exploring form, color, and movement in contemporary art."
    },
    {
      id: 5,
      main: gallery5,
      variations: [gallery5, gallery3, gallery1],
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
      {/* Nav Menu Toggle */}
      <div className="fixed top-[18px] md:top-[24px] left-[18px] md:left-[24px] z-50">
        <div 
          className="text-lg md:text-2xl font-normal cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '−' : '+'}
        </div>
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
        >
          <div className="flex flex-col gap-2 text-xs md:text-sm tracking-wider">
            <span className="text-foreground cursor-default font-normal">GALLERY</span>
            <span 
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200"
              onClick={() => onNavigate?.('about')}
            >
              ABOUT
            </span>
            <span className="text-muted-foreground cursor-default">OTHER</span>
          </div>
        </div>
      </div>

      {/* Theme Toggle Dot */}
      <div 
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onToggleTheme}
      />

      {/* Gallery Grid */}
      <div className="flex flex-col items-center justify-start min-h-screen">
        {images.map((image) => (
          <div 
            key={image.id}
            className="w-full flex items-center justify-center h-screen"
          >
            <img 
              src={image.main}
              alt={`Gallery item ${image.id}`}
              className="w-[80vmin] h-[80vmin] object-cover border border-foreground/20 hover:scale-105 transition-transform duration-300 cursor-pointer"
              loading={image.id === 1 ? "eager" : "lazy"}
              decoding="async"
              onClick={() => setSelectedImage(image.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;