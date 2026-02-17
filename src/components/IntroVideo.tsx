import { useState, useEffect, useRef } from 'react';
import introDark from '@/assets/intro-dark.mp4';
import introLight from '@/assets/intro-light.mp4';

interface IntroVideoProps {
  isDarkMode: boolean;
  onComplete: () => void;
}

const IntroVideo = ({ isDarkMode, onComplete }: IntroVideoProps) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start fade out at 1.33s - 0.33s = 1.0s
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
        className="w-[80vmin] h-[80vmin] flex items-center justify-center"
        style={{
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 0.33s ease-out',
        }}
      >
        <video
          className="w-full h-full object-cover"
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
