# CLAUDE.md

## Project

`@gfazioli/mantine-audio` — A Mantine-native audio player for React with **waveform visualisation** and **live spectrum analyser**, built on the Web Audio API. Compound component API (`<Audio.Controls>`, `<Audio.PlayButton>`, `<Audio.Timeline>`, `<Audio.Waveform>`, `<Audio.Spectrum>`, …), fully headless `useAudio` hook, theme-aware styling, accessibility, and full Styles API support.

Bootstrapped from `mantine-base-component` (the GitHub template for the Mantine Extensions ecosystem).

## Commands

| Command | Purpose |
|---------|---------|
| `yarn build` | Build the npm package via Rollup |
| `yarn dev` | Start the Next.js docs dev server (port 9281) |
| `yarn test` | Full test suite (syncpack + oxfmt + typecheck + lint + jest) |
| `yarn jest` | Run only Jest unit tests |
| `yarn docgen` | Generate component API docs (docgen.json) |
| `yarn docs:build` | Build the Next.js docs site for production |
| `yarn docs:deploy` | Build and deploy docs to GitHub Pages |
| `yarn lint` | Run oxlint + Stylelint |
| `yarn format:write` | Format all files with oxfmt |
| `yarn storybook` | Start Storybook dev server |
| `yarn clean` | Remove build artifacts |
| `yarn release:patch` | Bump patch version and deploy docs |

> **Important**: After changing the public API (props, types, exports), always run `yarn clean && yarn build` before `yarn test`, because `yarn docgen` needs the fresh build output.

## Architecture

### Workspace Layout

Yarn workspaces monorepo with two workspaces: `package/` (npm package) and `docs/` (Next.js documentation site).

### Package Source (`package/src/`)

- `Audio.tsx` — Main component using `factory()` with Mantine's Styles API. Wraps a native `<audio>` element with React-friendly props (controlled `playing`/`currentTime`/`volume`/`playbackRate`), 4 variants (`overlay`/`minimal`/`floating`/`bordered`), keyboard shortcuts, `asBackground` preset.
- `Audio.module.css` — CSS module with custom properties and data-attribute selectors
- `Audio.test.tsx` — Jest tests using `@mantine-tests/core` render helper
- `Audio.story.tsx` — Storybook stories
- `use-audio.ts` — Headless `useAudio` hook returning state + actions + Web Audio context. Handles event listeners on the `<audio>` element, decodes peaks via `decodeAudioData`, lazy-creates the `AudioContext` + `MediaElementAudioSourceNode` + `AnalyserNode` on first play.
- `Audio.context.ts` — Internal context shared with compound sub-components
- `captions.ts` — Pure helpers deriving caption state from a `TextTrackList` (`getCaptionTracks`, `isCaptionsActive`, `readActiveCueText`). Kept free of the DOM on purpose: jsdom stubs the TextTrack API, so this is the only way the cue logic gets real test coverage (see Testing).
- `components/` — Twelve compound sub-components:
  - **Core**: `AudioPlayButton`, `AudioMuteButton`, `AudioSkipButton`, `AudioTimeDisplay`, `AudioTimeline`, `AudioControls`
  - **Extras**: `AudioVolumeSlider`, `AudioSpeedControl`, `AudioWaveform`, `AudioSpectrum`
  - **Captions** (1.1.0): `AudioCaptions`, `AudioCaptionsButton`
- `index.ts` — Public exports (root component + sub-components + hook + types)

### Web Audio API integration

Two distinct flows:

1. **Waveform peaks** (`AudioWaveform`): when `src` changes the hook `fetch()`es the file, calls `decodeAudioData()` on a one-shot `AudioContext`, then downsamples to `waveformSamples` peaks (default 512). The decoded peaks are exposed via `ctx.peaks: Float32Array | null`. CORS-failing decodes produce `ctx.peaksError` and a null `peaks` — the Waveform component degrades gracefully.

2. **Live spectrum** (`AudioSpectrum`): the *main* `AudioContext` + `AnalyserNode` are lazy-created on first `play()` (browsers throw if you create them too early). The `<audio>` element is connected via `createMediaElementSource`, then to the `AnalyserNode`, then to `destination`. `AudioSpectrum` reads `analyser.getByteFrequencyData()` in a `requestAnimationFrame` loop while playing, and decays to zero when paused.

> **CORS**: the `<audio crossOrigin="anonymous">` attribute is mandatory for remote files to be decoded by Web Audio. The default `defaultProps.crossOrigin = 'anonymous'` covers most CDN cases.

### Build Pipeline

Rollup bundles to dual ESM (`dist/esm/`) and CJS (`dist/cjs/`) with `'use client'` banner. CSS modules are hashed with `hash-css-selector` (prefix `me`). TypeScript declarations via `rollup-plugin-dts`. CSS is split into `styles.css` and `styles.layer.css` (layered version).

### Docs (`docs/`)

- `docs/data.ts` — Package metadata
- `docs/docs.mdx` — Main documentation content
- `docs/demos/` — Interactive demos using `@mantinex/demo`
- `docs/pages/index.tsx` — Assembles Shell, PageHeader, DocsTabs, and the MDX content
- `docs/styles-api/` — Styles API data for the documentation table
- `docs/docgen.json` — Auto-generated from TypeScript types (don't edit manually)

The `next.config.mjs` dynamically sets `basePath` from the repository field in `package/package.json`.

## Component Details

### Compound API

```tsx
<Audio src="..." tracks={[{ src: '/en.vtt', srcLang: 'en', label: 'English' }]}>
  <Audio.Waveform height={80} />
  <Audio.Captions />
  <Audio.Controls>
    <Audio.PlayButton />
    <Audio.SkipButton seconds={-15} />
    <Audio.SkipButton seconds={15} />
    <Audio.Timeline />
    <Audio.TimeDisplay />
    <Audio.MuteButton />
    <Audio.VolumeSlider />
    <Audio.SpeedControl />
    <Audio.CaptionsButton />
  </Audio.Controls>
  <Audio.Spectrum barCount={48} colorMode="gradient" />
</Audio>
```

### Captions: why audio needs more than video

Adding a `<track>` is the whole job on `<video>` — the browser paints the cues over the picture. An
`<audio>` element has no picture, so **nothing renders**: the cue text has to be read off the
TextTrack API and rendered as DOM. Hence three pieces instead of one:

1. `tracks` prop on `Audio` → renders the `<track>` children. `children` cannot carry them, because
   that slot renders *outside* the media element (it is the control-bar slot).
2. State in `useAudio` (`activeCueText`, `captionsEnabled`, `hasCaptions`, `toggleCaptions`) — shared
   so `Audio.Captions` and `Audio.CaptionsButton` can never disagree about whether captions are on.
3. `Audio.Captions` renders the cue; `Audio.CaptionsButton` toggles. Both are in the default layout
   and both return `null` without a caption track.

An enabled track is put in `'hidden'`, not `'showing'`: both keep `cuechange` firing, but `'hidden'`
says the user agent is not drawing them — which is true — and rules out double-painting if a browser
ever gains a native caption surface for audio. Treat any mode other than `'disabled'` as on.

### Headless usage

```tsx
const { playing, currentTime, duration, peaks, analyser, play, pause, toggle, seek, audioRef } =
  useAudio({ src: 'https://example.com/track.mp3' });

return <audio ref={audioRef} />;
```

### Compound Registration Checklist

Follow [[compound-component-pattern]] from the workspace memory:

1. `staticComponents` declared in `AudioFactory` ✓
2. Sub-components attached at the bottom of `Audio.tsx` ✓
3. `displayName` set on parent and every sub-component ✓
4. Sub-component types exported from `index.ts` ✓
5. Registered in `scripts/docgen.ts`, `docs/pages/index.tsx` (DocsTabs `componentPrefix`), `docs/styles-api/`

### Theming

CSS variables (set on `.root`):
`--audio-color`, `--audio-radius`, `--audio-bg`, `--audio-text-color`, `--audio-timeline-color`, `--audio-timeline-thumb-color`, `--audio-waveform-color`, `--audio-waveform-played-color`, `--audio-spectrum-bar-color`.

## Testing

Jest with `jsdom` environment, `esbuild-jest` transform, CSS mocked via `identity-obj-proxy`. Component tests use `@mantine-tests/core` render helper.

Standard test coverage: renders without crashing, forwards ref, data attributes for variants/states, compound static properties.

**jsdom stubs the TextTrack API** — `audio.textTracks.length` stays `0` even with a `<track>` in the
DOM, `textTracks.addEventListener` is `undefined`, `trackElement.track` is `undefined`. So captions
cannot be exercised through real markup here. Two things fill the gap: `captions.test.ts` unit-tests
the pure derivation, and `Audio.captions.test.tsx` installs a fake `TextTrackList` on
`HTMLMediaElement.prototype` before render (restored in `afterEach`) to drive the components. What
neither can prove is that a browser really fires `cuechange` — verify that against a rendered player.

## Ecosystem

See the workspace `CLAUDE.md` (in the parent directory) for:
- Development checklist (code → test → build → docs → release)
- Cross-cutting patterns (compound components, responsive CSS, GitHub sync)
- Update packages workflow
- Release process
