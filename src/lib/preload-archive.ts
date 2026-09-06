import grills1 from '@/assets/archive-grills-1.png';
import grills2 from '@/assets/archive-grills-2.png';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';
import { preloadVideos } from '@/lib/video-cache';

// Preload every collection/archive image at app boot so pages never decode
// images while they are sliding into view.
const preloadImage = (src: string) => {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  if (typeof img.decode === 'function') {
    img.decode().catch(() => undefined);
  }
};

const IMAGES = [grills1, grills2, gallery1, gallery2, gallery3, gallery4, gallery5];
IMAGES.forEach(preloadImage);

// Fully download the transition clips (in priority order) so the very first
// play is instant instead of waiting on a progressive network fetch.
const VIDEOS = [
  '/transitions/darktrans1.mp4',
  '/transitions/lighttrans1.mp4',
  '/transitions/darktrans2.mp4',
  '/transitions/lighttrans2.mp4',
  '/transitions/placeholder1.mp4',
  '/transitions/placeholder2.mp4',
  '/transitions/placeholder3.mp4',
  '/transitions/placeholder4.mp4',
  '/transitions/reset1.mp4',
  '/transitions/reset2.mp4',
  '/transitions/reset3.mp4',
];

if (typeof window !== 'undefined') {
  const start = () => void preloadVideos(VIDEOS);
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (ric) ric(start);
  else setTimeout(start, 300);
}
