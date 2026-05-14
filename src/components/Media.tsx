import { useState, useRef, useEffect, useCallback } from 'react';
import fastLight from '@/assets/media-fast-light.mp4';
import fastDark from '@/assets/media-fast-dark.mp4';
import slowLight from '@/assets/media-slow-light.mp4';
import slowDark from '@/assets/media-slow-dark.mp4';

interface MediaProps {
  isDarkMode: boolean;
  onInspectChange?: (inspecting: boolean) => void;
  onBackHandlerReady?: (handler: (() => void) | null) => void;
}

const FADE_MS = 300;

const sizeClass =
  'max-w-[calc(100vw-96px)] max-h-[80vh] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw] object-contain';

const Media = ({ isDarkMode, onInspectChange, onBackHandlerReady }: MediaProps) => {
  const [inViewer, setInViewer] = useState(false);
  const [variation, setVariation] = useState<'fast' | 'slow'>('fast');

  // Thumbnail video refs
  const thumbLightRef = useRef<HTMLVideoElement>(null);
  const thumbDarkRef = useRef<HTMLVideoElement>(null);

  // Viewer video refs
  const vFastLightRef = useRef<HTMLVideoElement>(null);
  const vFastDarkRef = useRef<HTMLVideoElement>(null);
  const vSlowLightRef = useRef<HTMLVideoElement>(null);
  const vSlowDarkRef = useRef<HTMLVideoElement>(null);

  // Sync helper: keep two videos' currentTime aligned
  const syncPair = (a: HTMLVideoElement | null, b: HTMLVideoElement | null) => {
    if (!a || !b) return () => {};
    const onTime = () => {
      if (Math.abs(a.currentTime - b.currentTime) > 0.05) {
        try {
          b.currentTime = a.currentTime;
        } catch {
          /* ignore */
        }
      }
    };
    a.addEventListener('timeupdate', onTime);
    return () => a.removeEventListener('timeupdate', onTime);
  };

  useEffect(() => {
    const cleanups = [
      syncPair(thumbLightRef.current, thumbDarkRef.current),
      syncPair(vFastLightRef.current, vFastDarkRef.current),
      syncPair(vSlowLightRef.current, vSlowDarkRef.current),
    ];
    [
      thumbLightRef,
      thumbDarkRef,
      vFastLightRef,
      vFastDarkRef,
      vSlowLightRef,
      vSlowDarkRef,
    ].forEach((r) => {
      r.current?.play().catch(() => {});
    });
    return () => cleanups.forEach((c) => c());
  }, [inViewer]);

  const handleBack = useCallback(() => {
    setInViewer(false);
    setVariation('fast');
    onInspectChange?.(false);
  }, [onInspectChange]);

  useEffect(() => {
    if (inViewer) onBackHandlerReady?.(handleBack);
    else onBackHandlerReady?.(null);
  }, [inViewer, handleBack, onBackHandlerReady]);

  const openViewer = () => {
    setInViewer(true);
    onInspectChange?.(true);
  };

  const cycleVariation = () => {
    setVariation((v) => (v === 'fast' ? 'slow' : 'fast'));
  };

  const fadeStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transition: `opacity ${FADE_MS}ms ease-out`,
  });

  return (
    <div className="text-foreground font-mono min-h-screen">
      {!inViewer ? (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="relative inline-block cursor-pointer" onClick={openViewer}>
            {/* Light video defines layout */}
            <video
              ref={thumbLightRef}
              src={fastLight}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`block ${sizeClass}`}
              style={fadeStyle(!isDarkMode)}
            />
            {/* Dark video overlays */}
            <video
              ref={thumbDarkRef}
              src={fastDark}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-contain"
              style={fadeStyle(isDarkMode)}
            />
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="relative inline-block cursor-pointer" onClick={cycleVariation}>
            {/* Sizing video (always rendered, opacity controls visibility) */}
            <video
              ref={vFastLightRef}
              src={fastLight}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`block ${sizeClass}`}
              style={fadeStyle(variation === 'fast' && !isDarkMode)}
            />
            <video
              ref={vFastDarkRef}
              src={fastDark}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-contain"
              style={fadeStyle(variation === 'fast' && isDarkMode)}
            />
            <video
              ref={vSlowLightRef}
              src={slowLight}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-contain"
              style={fadeStyle(variation === 'slow' && !isDarkMode)}
            />
            <video
              ref={vSlowDarkRef}
              src={slowDark}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-contain"
              style={fadeStyle(variation === 'slow' && isDarkMode)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
