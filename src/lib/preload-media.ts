import fastLight from '@/assets/media-fast-light.mp4';
import fastDark from '@/assets/media-fast-dark.mp4';
import slowLight from '@/assets/media-slow-light.mp4';
import slowDark from '@/assets/media-slow-dark.mp4';

// Warm the browser's HTTP cache for media videos so opening MEDIA feels instant.
const preload = (src: string) => {
  try {
    const v = document.createElement('video');
    v.preload = 'auto';
    v.muted = true;
    v.playsInline = true;
    v.src = src;
    // Don't attach to DOM; the browser will still fetch via preload=auto.
    v.load();
  } catch {
    // ignore
  }
};

preload(fastLight);
preload(fastDark);
preload(slowLight);
preload(slowDark);
