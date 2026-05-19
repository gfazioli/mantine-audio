import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAudioOptions {
  src?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playbackRate?: number;
  volume?: number;
  playing?: boolean;
  onPlayChange?: (playing: boolean) => void;
  currentTime?: number;
  onCurrentTimeChange?: (currentTime: number) => void;
  onVolumeChange?: (volume: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onEnded?: () => void;
  onError?: (error: MediaError | null) => void;
  onDurationChange?: (duration: number) => void;
  /** Number of samples to compute for the waveform peaks (default: 512). Set to 0 to disable peaks computation. */
  waveformSamples?: number;
  /** FFT size for the spectrum analyser (default: 256, must be a power of two between 32 and 32768). */
  fftSize?: number;
  /** When true, skip Web Audio API initialisation entirely (peaks + spectrum disabled). */
  disableWebAudio?: boolean;
}

export interface UseAudioReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  paused: boolean;
  ended: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  isLoading: boolean;
  error: MediaError | null;
  canPlay: boolean;
  /** The URL the browser actually loaded — populated after `loadedmetadata`. With
   * multiple `<source>` children this is the entry the browser picked. */
  currentSrc: string | null;
  /** Downsampled waveform peaks in [0..1]. Null until decoded or when disabled/CORS-blocked. */
  peaks: Float32Array | null;
  peaksLoading: boolean;
  peaksError: Error | null;
  /** AnalyserNode for live spectrum visualisation. Null until the user starts playback at least once. */
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  seekBy: (delta: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
}

function downsamplePeaks(buffer: AudioBuffer, samples: number): Float32Array {
  const channel = buffer.getChannelData(0);
  const blockSize = Math.floor(channel.length / samples);
  const peaks = new Float32Array(samples);
  for (let i = 0; i < samples; i += 1) {
    const start = i * blockSize;
    let max = 0;
    for (let j = 0; j < blockSize; j += 1) {
      const value = Math.abs(channel[start + j] ?? 0);
      if (value > max) {
        max = value;
      }
    }
    peaks[i] = max;
  }
  return peaks;
}

export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volumeState, setVolumeState] = useState(options.volume ?? 1);
  const [mutedState, setMutedState] = useState(options.muted ?? false);
  const [playbackRateState, setPlaybackRateState] = useState(options.playbackRate ?? 1);
  const [ended, setEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MediaError | null>(null);
  const [canPlay, setCanPlay] = useState(false);

  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  const [peaksLoading, setPeaksLoading] = useState(false);
  const [peaksError, setPeaksError] = useState<Error | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  // Tracks the URL the browser actually loaded — works for single `src` AND for
  // `<source>` children where the browser picks one at load time.
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const audioGraphRef = useRef<{
    ctx: AudioContext;
    source: MediaElementAudioSourceNode;
    analyser: AnalyserNode;
  } | null>(null);

  useEffect(() => {
    const v = audioRef.current;
    if (!v) {
      return;
    }

    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
      optionsRef.current.onPlayChange?.(true);
    };
    const onPause = () => {
      setPlaying(false);
      optionsRef.current.onPlayChange?.(false);
    };
    const onEnded = () => {
      setEnded(true);
      setPlaying(false);
      optionsRef.current.onEnded?.();
    };
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      optionsRef.current.onCurrentTimeChange?.(v.currentTime);
    };
    const onDurationChange = () => {
      const d = v.duration || 0;
      setDuration(d);
      // currentSrc is populated by the time loadedmetadata fires (which also
      // fires durationchange). Capture it for the peaks-decoder effect below.
      // setState is a no-op if the value is unchanged.
      if (v.currentSrc) {
        setCurrentSrc(v.currentSrc);
      }
      optionsRef.current.onDurationChange?.(d);
    };
    const onVolumeChange = () => {
      setVolumeState(v.volume);
      setMutedState(v.muted);
      optionsRef.current.onVolumeChange?.(v.volume);
    };
    const onRateChange = () => {
      setPlaybackRateState(v.playbackRate);
      optionsRef.current.onPlaybackRateChange?.(v.playbackRate);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onCanPlay = () => {
      setCanPlay(true);
      setIsLoading(false);
    };
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBuffered(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onErrorEvent = () => {
      setError(v.error);
      setIsLoading(false);
      optionsRef.current.onError?.(v.error);
    };

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('durationchange', onDurationChange);
    v.addEventListener('loadedmetadata', onDurationChange);
    v.addEventListener('volumechange', onVolumeChange);
    v.addEventListener('ratechange', onRateChange);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('progress', onProgress);
    v.addEventListener('error', onErrorEvent);

    if (Number.isFinite(v.duration) && v.duration > 0) {
      setDuration(v.duration);
    }
    if (v.currentTime > 0) {
      setCurrentTime(v.currentTime);
    }
    if (v.volume !== 1 || v.muted) {
      setVolumeState(v.volume);
      setMutedState(v.muted);
    }
    if (v.playbackRate !== 1) {
      setPlaybackRateState(v.playbackRate);
    }
    if (!v.paused) {
      setPlaying(true);
    }
    if (v.readyState >= 3) {
      setCanPlay(true);
    }
    if (v.buffered.length > 0) {
      setBuffered(v.buffered.end(v.buffered.length - 1));
    }

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('durationchange', onDurationChange);
      v.removeEventListener('loadedmetadata', onDurationChange);
      v.removeEventListener('volumechange', onVolumeChange);
      v.removeEventListener('ratechange', onRateChange);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('progress', onProgress);
      v.removeEventListener('error', onErrorEvent);
    };
  }, []);

  // Controlled prop sync
  useEffect(() => {
    if (options.playing === undefined) {
      return;
    }
    const v = audioRef.current;
    if (!v) {
      return;
    }
    if (options.playing && v.paused) {
      v.play().catch(() => {});
    } else if (!options.playing && !v.paused) {
      v.pause();
    }
  }, [options.playing]);

  useEffect(() => {
    if (options.currentTime === undefined) {
      return;
    }
    const v = audioRef.current;
    if (!v) {
      return;
    }
    if (Math.abs(v.currentTime - options.currentTime) > 0.5) {
      v.currentTime = options.currentTime;
    }
  }, [options.currentTime]);

  useEffect(() => {
    if (options.volume === undefined) {
      return;
    }
    const v = audioRef.current;
    if (!v) {
      return;
    }
    if (Math.abs(v.volume - options.volume) > 0.01) {
      v.volume = Math.max(0, Math.min(1, options.volume));
    }
  }, [options.volume]);

  useEffect(() => {
    if (options.playbackRate === undefined) {
      return;
    }
    const v = audioRef.current;
    if (!v) {
      return;
    }
    if (v.playbackRate !== options.playbackRate) {
      v.playbackRate = options.playbackRate;
    }
  }, [options.playbackRate]);

  // Web Audio: decode peaks once a source URL is known. Prefer `currentSrc` (the
  // URL the browser actually loaded — works for both single `src` and `<source>`
  // children) and fall back to the user-provided `options.src` so we don't have
  // to wait for `loadedmetadata` in the common single-src case.
  useEffect(() => {
    if (options.disableWebAudio) {
      return;
    }
    const url = currentSrc || options.src;
    if (!url) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const samples = options.waveformSamples ?? 512;
    if (samples <= 0) {
      return;
    }

    let cancelled = false;
    setPeaks(null);
    setPeaksError(null);
    setPeaksLoading(true);

    const tempCtx = new AudioContextCtor();
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: HTTP ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then((buffer) => tempCtx.decodeAudioData(buffer.slice(0)))
      .then((audioBuffer) => {
        if (cancelled) {
          return;
        }
        setPeaks(downsamplePeaks(audioBuffer, samples));
        setPeaksLoading(false);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setPeaksError(err instanceof Error ? err : new Error(String(err)));
        setPeaksLoading(false);
      })
      .finally(() => {
        tempCtx.close().catch(() => {});
      });

    return () => {
      cancelled = true;
    };
  }, [currentSrc, options.src, options.disableWebAudio, options.waveformSamples]);

  // Web Audio: lazy-init AudioContext + AnalyserNode for live spectrum on first play
  const ensureAudioGraph = useCallback(() => {
    // Reuse existing graph only if still usable. A previously-closed context
    // (e.g. after StrictMode double-mount cleanup) cannot be resumed and will
    // throw on resume / connect — drop it and let the rebuild below run.
    if (audioGraphRef.current && audioGraphRef.current.ctx.state !== 'closed') {
      return audioGraphRef.current;
    }
    audioGraphRef.current = null;
    if (optionsRef.current.disableWebAudio) {
      return null;
    }
    if (typeof window === 'undefined') {
      return null;
    }
    const v = audioRef.current;
    if (!v) {
      return null;
    }
    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    try {
      const ctx = new AudioContextCtor();
      const source = ctx.createMediaElementSource(v);
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = optionsRef.current.fftSize ?? 256;
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);
      audioGraphRef.current = { ctx, source, analyser: analyserNode };
      setAudioContext(ctx);
      setAnalyser(analyserNode);
      return audioGraphRef.current;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      audioGraphRef.current?.ctx.close().catch(() => {});
      audioGraphRef.current = null;
    };
  }, []);

  const play = useCallback(async () => {
    const v = audioRef.current;
    if (!v) {
      return;
    }
    const graph = ensureAudioGraph();
    // Only resume if the context is suspended. A closed context cannot be
    // resumed and will throw — leave the <audio> element to play without
    // Web Audio routing in that case.
    if (graph && graph.ctx.state === 'suspended') {
      await graph.ctx.resume().catch(() => {});
    }
    try {
      await v.play();
    } catch {
      // autoplay blocked or similar — surface via error event
    }
  }, [ensureAudioGraph]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const v = audioRef.current;
    if (!v) {
      return;
    }
    const graph = ensureAudioGraph();
    if (graph && graph.ctx.state === 'suspended') {
      graph.ctx.resume().catch(() => {});
    }
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [ensureAudioGraph]);

  const seek = useCallback((time: number) => {
    const v = audioRef.current;
    if (!v) {
      return;
    }
    const max = Number.isFinite(v.duration) ? v.duration : Infinity;
    v.currentTime = Math.max(0, Math.min(time, max));
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = audioRef.current;
    if (!v) {
      return;
    }
    const max = Number.isFinite(v.duration) ? v.duration : Infinity;
    v.currentTime = Math.max(0, Math.min(v.currentTime + delta, max));
  }, []);

  const setVolume = useCallback((vol: number) => {
    const v = audioRef.current;
    if (!v) {
      return;
    }
    v.volume = Math.max(0, Math.min(1, vol));
    if (vol > 0 && v.muted) {
      v.muted = false;
    }
  }, []);

  const mute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = true;
    }
  }, []);

  const unmute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = false;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = audioRef.current;
    if (!v) {
      return;
    }
    v.muted = !v.muted;
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  return {
    audioRef,
    playing,
    paused: !playing,
    ended,
    currentTime,
    duration,
    buffered,
    volume: volumeState,
    muted: mutedState,
    playbackRate: playbackRateState,
    isLoading,
    error,
    canPlay,
    currentSrc,
    peaks,
    peaksLoading,
    peaksError,
    analyser,
    audioContext,
    play,
    pause,
    toggle,
    seek,
    seekBy,
    setVolume,
    mute,
    unmute,
    toggleMute,
    setPlaybackRate,
  };
}
