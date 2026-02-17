import { useState, useEffect, useRef } from 'react';

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
        className="w-[80vmin] h-[80vmin] flex items-center justify-center border border-foreground/20"
        style={{
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 0.33s ease-out',
        }}
      >
        {/* Placeholder: simple animated square */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className="w-16 h-16 border-2 border-foreground animate-spin"
            style={{ animationDuration: '2s' }}
          />
          <span className="text-foreground/50 text-xs font-mono tracking-widest uppercase">
            {isDarkMode ? 'dark' : 'light'} intro placeholder
          </span>
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;
