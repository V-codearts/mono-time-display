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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStarted = useRef(false);
  const hasCompleted = useRef(false);

  const completeIntro = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    onComplete();
  }, [onComplete]);

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

    const onReady = () => {
      startSequence();
    };

    const onError = () => {
      startSequence();
    };

    // If video is already ready (cached), start immediately
    if (video.readyState >= 3) {
      startSequence();
    }

    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('playing', onReady);
    video.addEventListener('error', onError);

    void video.play().catch(() => {
      startSequence();
    });

    // Fallback: if video never loads after 3s, start anyway
    const fallback = setTimeout(() => {
      startSequence();
    }, 3000);

    const completionFallback = setTimeout(() => {
      setIsFadingOut(true);
    }, 3500);

    return () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('playing', onReady);
      video.removeEventListener('error', onError);
      clearTimeout(fallback);
      clearTimeout(completionFallback);
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
        completeIntro();
      }, 165);
      return () => clearTimeout(fadeTimer);
    }
  }, [isFadingOut, completeIntro]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div
        className="relative w-[80vmin] h-[80vmin] flex items-center justify-center overflow-hidden"
        style={{
          opacity: isFadingOut ? 0 : isFadedIn ? 1 : 0,
          transition: isFadingOut ? 'opacity 0.165s ease-out' : 'opacity 0.325s ease-out',
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={isDarkMode ? introDark : introLight}
          autoPlay
          muted
          playsInline
          preload="auto"
        />
        {/* Edge bars to hide video artifacts */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-background" />
        <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-background" />
        <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-background" />
        <div className="absolute top-0 right-0 bottom-0 w-[5px] bg-background" />
      </div>
    </div>
  );
};

export default IntroVideo;
