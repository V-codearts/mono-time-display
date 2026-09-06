// Fully downloads transition clips into memory (blob URLs) so the first play
// never waits on the network. Falls back to the original path until ready.

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export const resolveVideoSrc = (src: string) => cache.get(src) ?? src;

export const preloadVideo = (src: string): Promise<string> => {
  const cached = cache.get(src);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(src);
  if (pending) return pending;

  const task = fetch(src)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      cache.set(src, url);
      // Decode the first frame so playback starts instantly.
      const v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.playsInline = true;
      v.src = url;
      v.load();
      (window as unknown as { __warmedVideos?: HTMLVideoElement[] }).__warmedVideos = [
        ...((window as unknown as { __warmedVideos?: HTMLVideoElement[] }).__warmedVideos ?? []),
        v,
      ];
      return url;
    })
    .catch(() => src)
    .finally(() => inflight.delete(src));

  inflight.set(src, task);
  return task;
};

export const preloadVideos = async (sources: string[]) => {
  for (const src of sources) {
    // Sequential so the first (most likely used) clips land first.
    await preloadVideo(src);
  }
};
