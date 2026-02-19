import { useState, useEffect, useRef, useCallback } from 'react';
import introDark from '@/assets/intro-dark.mp4';
import introLight from '@/assets/intro-light.mp4';

interface IntroVideoProps {
  isDarkMode: boolean;
  onComplete: () => void;
}

const IntroVideo = ({ isDarkMode, onComplete }: IntroVideoProps) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadedIn, setIsFadedIn] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStarted = useRef(false);

  const startSequence = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Small delay then fade in
    setTimeout(() => {
      requestAnimationFrame(() => setIsFadedIn(true));
    }, 100);

    // Fade out after intro plays (0.1s delay + 1.0s show)
    timerRef.current = setTimeout(() => {
      setIsFadingOut(true);
    }, 1100);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // If video is already ready (cached), start immediately
    if (video.readyState >= 3) {
      startSequence();
      return;
    }

    const onCanPlay = () => startSequence();
    video.addEventListener('canplay', onCanPlay);

    // Fallback: if video never loads after 3s, start anyway
    const fallback = setTimeout(() => startSequence(), 3000);

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      clearTimeout(fallback);
    };
  }, [startSequence]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isFadingOut) {
      const fadeTimer = setTimeout(() => {
        onComplete();
      }, 165);
      return () => clearTimeout(fadeTimer);
    }
  }, [isFadingOut, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div
        className="w-[80vmin] h-[80vmin] flex items-center justify-center overflow-hidden"
        style={{
          opacity: isFadingOut ? 0 : isFadedIn ? 1 : 0,
          transition: isFadingOut ? 'opacity 0.165s ease-out' : 'opacity 0.325s ease-out',
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ marginLeft: '-4px', marginBottom: '-4px', width: 'calc(100% + 4px)', height: 'calc(100% + 4px)' }}
          src={isDarkMode ? introDark : introLight}
          autoPlay
          muted
          playsInline
          preload="auto"
        />
      </div>
    </div>
  );
};

export default IntroVideo;
