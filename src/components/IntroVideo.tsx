import { useState, useEffect, useRef, useCallback } from 'react';
import introDark from '@/assets/intro-dark.mp4';
import introLight from '@/assets/intro-light.mp4';

interface IntroVideoProps {
  isDarkMode: boolean;
  onComplete: () => void;
}

const IntroVideo = ({ isDarkMode, onComplete }: IntroVideoProps) => {
  const [hidden, setHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStarted = useRef(false);
  const hasCompleted = useRef(false);

  const completeIntro = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    setHidden(true);
    onComplete();
  }, [onComplete]);

  const startSequence = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    timerRef.current = setTimeout(() => {
      completeIntro();
    }, 1720);
  }, [completeIntro]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => startSequence();
    const onError = () => startSequence();

    if (video.readyState >= 3) startSequence();

    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    video.addEventListener('playing', onReady);
    video.addEventListener('error', onError);

    void video.play().catch(() => startSequence());

    const fallback = setTimeout(() => startSequence(), 3000);

    return () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('playing', onReady);
      video.removeEventListener('error', onError);
      clearTimeout(fallback);
    };
  }, [startSequence]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="relative w-[80vmin] h-[80vmin] flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={isDarkMode ? introDark : introLight}
          autoPlay
          muted
          playsInline
          preload="auto"
        />
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-background" />
        <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-background" />
        <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-background" />
        <div className="absolute top-0 right-0 bottom-0 w-[5px] bg-background" />
      </div>
    </div>
  );
};

export default IntroVideo;
