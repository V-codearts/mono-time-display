import { forwardRef, Suspense, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import type { ImageViewerHandle } from '@/components/ImageViewer';

interface ModelData {
  id: number;
  title: string;
  description: string;
  model: string;       // path/url to .glb
  thumbnail: string;   // 2D fallback for FLIP
}

interface ModelViewerProps {
  image: ModelData;
  onBack: () => void;
}

const FADE_MS = 300;

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

const ModelViewer = forwardRef<ImageViewerHandle, ModelViewerProps>(({ image }, ref) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  useImperativeHandle(ref, () => ({
    getImageEl: () => imgRef.current,
    getCurrentSrc: () => image.thumbnail,
    prepareForReturnToThumbnail: async () => {
      // Hide canvas instantly so the FLIP thumbnail is what animates back.
      setShowCanvas(false);
      setCanvasReady(false);
      // Let React commit before measurement.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    },
  }), [image]);

  // Reveal canvas after a tick so the parent FLIP completes on the <img> first.
  useEffect(() => {
    const t = window.setTimeout(() => setShowCanvas(true), 350);
    return () => window.clearTimeout(t);
  }, [image.id]);

  return (
    <div className="bg-background text-foreground font-mono min-h-screen flex items-center justify-center p-8">
      <div className="relative flex items-center justify-center w-full max-w-[80vw] h-full max-h-[80vh] aspect-square">
        <img
          ref={imgRef}
          src={image.thumbnail}
          alt={image.title}
          className="max-w-[80vw] max-h-[80vh] object-contain border border-foreground/20"
          style={{
            opacity: canvasReady ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease-out`,
          }}
        />
        {showCanvas && (
          <div
            className="absolute inset-0 border border-foreground/20"
            style={{
              opacity: canvasReady ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-out`,
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 4], fov: 45 }}
              onCreated={() => setCanvasReady(true)}
            >
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.6}>
                  <Model url={image.model} />
                </Stage>
              </Suspense>
              <OrbitControls enablePan={false} makeDefault />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;
