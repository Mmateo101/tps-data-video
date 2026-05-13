import { staticFile } from 'remotion';

export type DetectedMode = 'scenes' | 'single' | 'unknown';

export let detectedMode: DetectedMode = 'unknown';
export let availableScenes: Set<number> = new Set();

type Subscriber = () => void;
const subscribers: Subscriber[] = [];
let detectionStarted = false;

/**
 * Subscribe to be notified when detection finishes.
 * If detection is already done, the callback fires synchronously.
 * Returns an unsubscribe function.
 */
export function onDetectionComplete(cb: Subscriber): () => void {
  if (detectedMode !== 'unknown') {
    cb();
    return () => {};
  }
  subscribers.push(cb);
  return () => {
    const i = subscribers.indexOf(cb);
    if (i !== -1) subscribers.splice(i, 1);
  };
}

/**
 * Kick off parallel HEAD requests for all 8 scene videos.
 * Idempotent — safe to call from every PersonPanel mount.
 */
export function runDetection(): void {
  if (detectionStarted) return;
  detectionStarted = true;

  const ids = [1, 2, 3, 4, 5, 6, 7, 8];

  Promise.all(
    ids.map(async (n) => {
      try {
        const res = await fetch(staticFile(`videos/scene${n}.mp4`), { method: 'HEAD' });
        return { n, ok: res.ok };
      } catch {
        return { n, ok: false };
      }
    }),
  ).then((results) => {
    availableScenes = new Set(results.filter((r) => r.ok).map((r) => r.n));

    const hasFirst = availableScenes.has(1);
    const hasAll = ids.every((n) => availableScenes.has(n));

    if (hasAll) {
      detectedMode = 'scenes';
    } else if (hasFirst) {
      detectedMode = 'single';
    } else {
      detectedMode = 'unknown';
    }

    subscribers.forEach((cb) => cb());
    subscribers.length = 0;
  });
}
