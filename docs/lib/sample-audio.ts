/**
 * Local sample audio files served from `docs/public/audio/`.
 *
 * - `showcase.mp3` (~175 KB, 11s) — short user-provided clip used by the basic
 *   Usage / Configurator / Styles API demos.
 * - `topcat.mp3` (~674 KB, 43s) — 43-second user-provided clip used by the
 *   Waveform demo and configurator. Picked for its dynamic level variations
 *   that produce a visually rich waveform.
 * - `topcat-en.vtt` — sample WebVTT caption track for `topcat.mp3`, used by the Captions demo.
 *   Illustrative rather than a transcript; see the NOTE block inside the file.
 * - `mozart.mp3` (~2.6 MB, 3:46) — Rondò alla Turca K331 performed by Alicia
 *   de Larrocha, re-encoded to 96 kbps stereo. Used by the Spectrum demo.
 *
 * All paths must go through `useAssetPath` so they respect the GitHub Pages
 * `basePath` (`/mantine-audio` in production, empty in dev).
 */

import { useRouter } from 'next/router';

const SHOWCASE_PATH = '/audio/showcase.mp3';
const TOPCAT_PATH = '/audio/topcat.mp3';
const MOZART_PATH = '/audio/mozart.mp3';
const TOPCAT_CAPTIONS_PATH = '/audio/topcat-en.vtt';

function useAssetPath(path: string) {
  const { basePath } = useRouter();
  return `${basePath}${path}`;
}

export function useSampleAudio() {
  return {
    showcase: useAssetPath(SHOWCASE_PATH),
    topcat: useAssetPath(TOPCAT_PATH),
    mozart: useAssetPath(MOZART_PATH),
    topcatCaptions: useAssetPath(TOPCAT_CAPTIONS_PATH),
  };
}
