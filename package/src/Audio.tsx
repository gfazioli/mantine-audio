import {
  Box,
  BoxProps,
  createVarsResolver,
  ElementProps,
  Factory,
  factory,
  getRadius,
  getThemeColor,
  StylesApiProps,
  useProps,
  useStyles,
  type MantineColor,
  type MantineRadius,
  type MantineSize,
} from '@mantine/core';
import React, { useCallback, useEffect, useState } from 'react';
import { AudioProvider } from './Audio.context';
import { AudioControls } from './components/AudioControls';
import { AudioMuteButton } from './components/AudioMuteButton';
import { AudioPlayButton } from './components/AudioPlayButton';
import { AudioSkipButton } from './components/AudioSkipButton';
import { AudioSpectrum } from './components/AudioSpectrum';
import { AudioSpeedControl } from './components/AudioSpeedControl';
import { AudioTimeDisplay } from './components/AudioTimeDisplay';
import { AudioTimeline } from './components/AudioTimeline';
import { AudioVolumeSlider } from './components/AudioVolumeSlider';
import { AudioWaveform } from './components/AudioWaveform';
import { useAudio } from './use-audio';
import classes from './Audio.module.css';

export type AudioVariant = 'overlay' | 'minimal' | 'floating' | 'bordered';

/**
 * Entry for the `sources` prop. Renders one `<source>` child inside the underlying
 * `<audio>` element, letting the browser pick the first playable one via `canPlayType()`.
 */
export interface AudioSource {
  /** URL of the audio file. */
  src: string;
  /** MIME type with optional codec hint, e.g. `'audio/mp4; codecs="mp4a.40.2"'`. */
  type?: string;
  /** Media query, e.g. `'(max-width: 768px)'`. Forwarded to the `media` attribute. */
  media?: string;
}

export type AudioStylesNames =
  | 'root'
  | 'audio'
  | 'controls'
  | 'controlBar'
  | 'playButton'
  | 'timeline'
  | 'timelineBuffered'
  | 'timeDisplay'
  | 'muteButton'
  | 'skipButton'
  | 'volumeSlider'
  | 'speedControl'
  | 'waveform'
  | 'waveformCanvas'
  | 'waveformHover'
  | 'spectrum'
  | 'spectrumCanvas'
  | 'backgroundMuteButton';

export type AudioCssVariables = {
  root:
    | '--audio-color'
    | '--audio-radius'
    | '--audio-bg'
    | '--audio-text-color'
    | '--audio-timeline-color'
    | '--audio-timeline-thumb-color'
    | '--audio-waveform-color'
    | '--audio-waveform-played-color'
    | '--audio-spectrum-bar-color';
};

export interface AudioBaseProps {
  /** Audio source URL. Mutually exclusive with `sources` — if both are set, `sources` wins. */
  src?: string;

  /**
   * Multiple `<source>` entries for cross-browser / codec / adaptive-bitrate delivery.
   * When set, replaces the single `src` and the browser picks the first entry it can
   * play via `canPlayType()`. Example:
   *
   * ```tsx
   * <Audio sources={[
   *   { src: '/track.aac', type: 'audio/aac' },
   *   { src: '/track.ogg', type: 'audio/ogg' },
   *   { src: '/track.mp3', type: 'audio/mpeg' },
   * ]} />
   * ```
   */
  sources?: AudioSource[];

  /**
   * URL shown as a last-resort fallback if every entry in `src` / `sources` fails to
   * load at runtime (fires the `error` event on `<audio>`). Mirrors the equivalent
   * prop on Mantine `Image`.
   */
  fallbackSrc?: string;

  /** Render the default control bar; set to `false` to bring your own children */
  controls?: boolean;

  /** Auto-play (browsers usually require `muted` for this to work) */
  autoPlay?: boolean;

  /** Mute initially */
  muted?: boolean;

  /** Loop on end */
  loop?: boolean;

  /** Preload hint forwarded to the `<audio>` element */
  preload?: 'none' | 'metadata' | 'auto';

  /**
   * CORS mode forwarded to the `<audio>` element. Set to `'anonymous'` (default) so the
   * Web Audio API can decode peaks and connect a MediaElementSource on remote files.
   */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';

  /** Controlled playing state */
  playing?: boolean;

  /** Called when play state changes */
  onPlayChange?: (playing: boolean) => void;

  /** Controlled current time (seconds) */
  currentTime?: number;

  /** Called when the current time changes */
  onCurrentTimeChange?: (currentTime: number) => void;

  /** Controlled volume (0..1) */
  volume?: number;

  /** Called when the volume changes */
  onVolumeChange?: (volume: number) => void;

  /** Controlled playback rate */
  playbackRate?: number;

  /** Called when the playback rate changes */
  onPlaybackRateChange?: (rate: number) => void;

  /** Theme color used for the timeline fill, thumb and active states */
  color?: MantineColor;

  /** Border radius applied to the container */
  radius?: MantineRadius | (string & {}) | number;

  /** Enable keyboard shortcuts when the player is focused (Space/K, J/L, ←/→, ↑/↓, M, > <) */
  shortcuts?: boolean;

  /** Size scale for control elements */
  size?: MantineSize | (string & {});

  /** Number of samples for the waveform peaks. Default `512`. Set to `0` to disable peaks. */
  waveformSamples?: number;

  /** FFT size for the spectrum analyser. Default `256`. */
  fftSize?: number;

  /** Disable Web Audio API initialisation entirely (peaks + spectrum disabled). */
  disableWebAudio?: boolean;

  /**
   * Default `scrubSound` value propagated to `Audio.Timeline` and `Audio.Waveform`
   * children. When `true`, the audio keeps playing during a seek-drag and the user
   * hears short snippets as the cursor moves (Audacity / Adobe Audition style).
   * Individual children can still override via their own `scrubSound` prop.
   * Default `false`.
   */
  scrubSound?: boolean;

  /** Called when the audio ends */
  onEnded?: () => void;

  /** Called when an error occurs on the underlying `<audio>` element */
  onError?: (error: MediaError | null) => void;

  /**
   * Convenience preset for using the player as a section / page background ambient track.
   * When `true`:
   * - positions itself absolutely (`position: absolute; inset: 0`) to fill its parent
   * - disables `controls`, `shortcuts` *as defaults*
   * - renders a small floating mute toggle (unless `backgroundMuteButton={false}`)
   */
  asBackground?: boolean;

  /**
   * When `asBackground` is `true`, render a small floating mute toggle so users can
   * opt in/out of audio. Default `true`.
   */
  backgroundMuteButton?: boolean;
}

export interface AudioProps
  extends
    BoxProps,
    AudioBaseProps,
    StylesApiProps<AudioFactory>,
    Omit<ElementProps<'div', keyof AudioBaseProps>, 'color' | 'onError'> {}

export type AudioFactory = Factory<{
  props: AudioProps;
  ref: HTMLDivElement;
  stylesNames: AudioStylesNames;
  variant: AudioVariant;
  vars: AudioCssVariables;
  staticComponents: {
    Controls: typeof AudioControls;
    PlayButton: typeof AudioPlayButton;
    Timeline: typeof AudioTimeline;
    TimeDisplay: typeof AudioTimeDisplay;
    MuteButton: typeof AudioMuteButton;
    SkipButton: typeof AudioSkipButton;
    VolumeSlider: typeof AudioVolumeSlider;
    SpeedControl: typeof AudioSpeedControl;
    Waveform: typeof AudioWaveform;
    Spectrum: typeof AudioSpectrum;
  };
}>;

const defaultProps: Partial<AudioProps> = {
  color: 'blue',
  radius: 'md',
  size: 'md',
  variant: 'overlay',
  preload: 'metadata',
  crossOrigin: 'anonymous',
  waveformSamples: 512,
  fftSize: 256,
  backgroundMuteButton: true,
};

const varsResolver = createVarsResolver<AudioFactory>((theme, { color, radius }) => {
  const themeColor = getThemeColor(color, theme);
  return {
    root: {
      '--audio-color': themeColor,
      '--audio-radius': radius === undefined ? undefined : getRadius(radius),
      '--audio-bg': undefined,
      '--audio-text-color': undefined,
      '--audio-timeline-color': undefined,
      '--audio-timeline-thumb-color': undefined,
      '--audio-waveform-color': undefined,
      '--audio-waveform-played-color': undefined,
      '--audio-spectrum-bar-color': undefined,
    },
  };
});

export const Audio = factory<AudioFactory>((_props) => {
  const props = useProps('Audio', defaultProps, _props);
  const {
    ref,
    src,
    sources,
    fallbackSrc,
    controls: _controls,
    autoPlay,
    muted,
    loop,
    preload,
    crossOrigin,
    playing: controlledPlaying,
    onPlayChange,
    currentTime: controlledCurrentTime,
    onCurrentTimeChange,
    volume: controlledVolume,
    onVolumeChange,
    playbackRate: controlledPlaybackRate,
    onPlaybackRateChange,
    color: _color,
    radius: _radius,
    size,
    variant,
    shortcuts: _shortcuts,
    waveformSamples,
    fftSize,
    disableWebAudio,
    scrubSound = false,
    onEnded,
    onError,
    asBackground,
    backgroundMuteButton,
    children,
    classNames,
    style,
    styles,
    unstyled,
    vars,
    className,
    mod,
    ...others
  } = props;

  const controls = _props.controls ?? !asBackground;
  const shortcuts = _props.shortcuts ?? !asBackground;

  // Dev warning: src and sources are mutually exclusive. sources wins.
  if (process.env.NODE_ENV !== 'production' && src && sources && sources.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      '[mantine-audio] Both `src` and `sources` are set — `sources` will be used. Pass only one.'
    );
  }

  // Runtime fallback: if every entry in src/sources fails to load (the <audio>
  // error event fires) and `fallbackSrc` is set, swap to it once.
  const [fallbackActive, setFallbackActive] = useState(false);
  useEffect(() => {
    setFallbackActive(false);
  }, [src, sources, fallbackSrc]);

  const handleError = useCallback(
    (error: MediaError | null) => {
      if (fallbackSrc && !fallbackActive) {
        setFallbackActive(true);
      }
      onError?.(error);
    },
    [fallbackSrc, fallbackActive, onError]
  );

  const usingSources = !fallbackActive && Array.isArray(sources) && sources.length > 0;
  const effectiveSrc = fallbackActive ? fallbackSrc : usingSources ? undefined : src;

  const getStyles = useStyles<AudioFactory>({
    name: 'Audio',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  const audio = useAudio({
    src,
    autoPlay,
    muted,
    loop,
    playing: controlledPlaying,
    onPlayChange,
    currentTime: controlledCurrentTime,
    onCurrentTimeChange,
    volume: controlledVolume,
    onVolumeChange,
    playbackRate: controlledPlaybackRate,
    onPlaybackRateChange,
    onEnded,
    onError: handleError,
    waveformSamples,
    fftSize,
    disableWebAudio,
  });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!shortcuts) {
        return;
      }
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'k':
        case 'K':
          event.preventDefault();
          audio.toggle();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          event.preventDefault();
          audio.seekBy(event.key === 'ArrowLeft' ? -5 : -10);
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          event.preventDefault();
          audio.seekBy(event.key === 'ArrowRight' ? 5 : 10);
          break;
        case 'ArrowUp':
          event.preventDefault();
          audio.setVolume(Math.min(1, audio.volume + 0.05));
          break;
        case 'ArrowDown':
          event.preventDefault();
          audio.setVolume(Math.max(0, audio.volume - 0.05));
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          audio.toggleMute();
          break;
        case '>':
        case '.':
          event.preventDefault();
          audio.setPlaybackRate(Math.min(4, +(audio.playbackRate + 0.25).toFixed(2)));
          break;
        case '<':
        case ',':
          event.preventDefault();
          audio.setPlaybackRate(Math.max(0.25, +(audio.playbackRate - 0.25).toFixed(2)));
          break;
        default:
          break;
      }
    },
    [shortcuts, audio]
  );

  return (
    <AudioProvider
      value={{
        ...audio,
        getStyles,
        scrubSound,
      }}
    >
      <Box
        {...getStyles('root')}
        {...others}
        ref={ref}
        mod={[
          {
            variant,
            size,
            playing: audio.playing,
            paused: audio.paused && !audio.ended,
            ended: audio.ended,
            'as-background': asBackground,
          },
          mod,
        ]}
        tabIndex={shortcuts ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
        <audio
          {...getStyles('audio')}
          ref={audio.audioRef}
          src={effectiveSrc}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload={preload}
          crossOrigin={crossOrigin === '' ? undefined : crossOrigin}
        >
          {usingSources &&
            sources!.map((s, i) => (
              <source key={`${s.src}-${i}`} src={s.src} type={s.type} media={s.media} />
            ))}
        </audio>
        {asBackground && backgroundMuteButton && (
          <AudioMuteButton {...getStyles('backgroundMuteButton')} />
        )}
        {children ?? (controls && <AudioControls />)}
      </Box>
    </AudioProvider>
  );
});

Audio.classes = classes;
Audio.displayName = 'Audio';
Audio.Controls = AudioControls;
Audio.PlayButton = AudioPlayButton;
Audio.Timeline = AudioTimeline;
Audio.TimeDisplay = AudioTimeDisplay;
Audio.MuteButton = AudioMuteButton;
Audio.SkipButton = AudioSkipButton;
Audio.VolumeSlider = AudioVolumeSlider;
Audio.SpeedControl = AudioSpeedControl;
Audio.Waveform = AudioWaveform;
Audio.Spectrum = AudioSpectrum;
