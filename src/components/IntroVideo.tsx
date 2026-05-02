import { useState, useEffect, useRef, useCallback } from 'react';
import introDark from '@/assets/intro-dark.mp4';
import introLight from '@/assets/intro-light.mp4';

interface IntroVideoProps {
  isDarkMode: boolean;
  onComplete: () => void;
}

// Time the video stays visible AFTER the first real frame is painted.
const SHOW_MS = 1000;
const FADE_OUT_MS = 165;
const FADE_IN_MS = 325;
// Hard ceiling — if the video never paints anything, give up and move on.
const HARD_FALLBACK_MS = 2500;

const IntroVideo = ({ isDarkMode, onComplete }: IntroVideoProps) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadedIn, setIsFadedIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStarted = useRef(false);
  const hasCompleted = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeIntro = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    onComplete();
  }, [onComplete]);

  // Begin the visible timeline. Called once a real frame is on screen
  // (or by the hard fallback if the video never gets there).
  const startSequence = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    requestAnimationFrame(() => setIsFadedIn(true));

    showTimerRef.current = setTimeout(() => {
      setIsFadingOut(true);
    }, SHOW_MS);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      startSequence();
      return;
    }

    let cancelled = false;

    const tryPlay = () => {
      // Force a fresh attempt; some browsers stall autoplay until we ask.
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Autoplay blocked or decode failed — don't leave the user staring
          // at a blank square. Move on.
          if (!cancelled) startSequence();
        });
      }
    };

    // Prefer the most reliable "a frame is actually visible" signal.
    const anyVideo = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };

    const onFirstFrame = () => {
      if (cancelled) return;
      startSequence();
    };

    if (typeof anyVideo.requestVideoFrameCallback === 'function') {
      anyVideo.requestVideoFrameCallback(onFirstFrame);
    }

    // Fallback signals in case rVFC isn't available or never fires.
    video.addEventListener('playing', onFirstFrame);
    video.addEventListener('timeupdate', onFirstFrame);
    video.addEventListener('error', onFirstFrame);

    // Kick off playback. Retry once if the element wasn't ready yet.
    tryPlay();
    const retry = setTimeout(tryPlay, 250);

    // Hard ceiling so a broken/blocked video can never freeze the intro.
    const hardFallback = setTimeout(() => {
      if (!cancelled) startSequence();
    }, HARD_FALLBACK_MS);

    return () => {
      cancelled = true;
      video.removeEventListener('playing', onFirstFrame);
      video.removeEventListener('timeupdate', onFirstFrame);
      video.removeEventListener('error', onFirstFrame);
      clearTimeout(retry);
      clearTimeout(hardFallback);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [startSequence]);

  useEffect(() => {
    if (!isFadingOut) return;
    const t = setTimeout(completeIntro, FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [isFadingOut, completeIntro]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div
        className="relative w-[80vmin] h-[80vmin] flex items-center justify-center overflow-hidden"
        style={{
          opacity: isFadingOut ? 0 : isFadedIn ? 1 : 0,
          transition: isFadingOut
            ? `opacity ${FADE_OUT_MS}ms ease-out`
            : `opacity ${FADE_IN_MS}ms ease-out`,
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
