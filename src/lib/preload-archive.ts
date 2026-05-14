import grills1 from '@/assets/archive-grills-1.png';
import grills2 from '@/assets/archive-grills-2.png';

// Preload archive images at app boot so opening ARCHIVE feels instant.
const preload = (src: string) => {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  if (typeof img.decode === 'function') {
    img.decode().catch(() => undefined);
  }
};

preload(grills1);
preload(grills2);
