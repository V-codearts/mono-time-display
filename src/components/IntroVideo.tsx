import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Trigger fade-in on next frame
    requestAnimationFrame(() => setIsFadedIn(true));

    // Start fade out at 1.0s (total intro = 1.33s)
    timerRef.current = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isFadingOut) {
      const fadeTimer = setTimeout(() => {
        onComplete();
      }, 330);
      return () => clearTimeout(fadeTimer);
    }
  }, [isFadingOut, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div
        className="w-[80vmin] h-[80vmin] flex items-center justify-center overflow-hidden"
        style={{
          opacity: isFadingOut ? 0 : isFadedIn ? 1 : 0,
          transition: isFadingOut ? 'opacity 0.33s ease-out' : 'opacity 0.25s ease-out',
        }}
      >
        <video
          className="w-full h-full object-cover"
          style={{ marginLeft: '-4px', width: 'calc(100% + 4px)' }}
          src={isDarkMode ? introDark : introLight}
          autoPlay
          muted
          playsInline
        />
      </div>
    </div>
  );
};

export default IntroVideo;
