import {
  Box,
  getRadius,
  getThemeColor,
  useMantineTheme,
  type BoxProps,
  type MantineColor,
  type MantineRadius,
} from '@mantine/core';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useAudioContext } from '../Audio.context';

// Canvas API requires fully-parsed color strings; resolve `var(--x)` references
// via a throwaway helper element.
function resolveCssColor(value: string): string {
  if (!value) {
    return 'transparent';
  }
  if (
    value.startsWith('#') ||
    value.startsWith('rgb') ||
    value.startsWith('hsl') ||
    value === 'transparent'
  ) {
    return value;
  }
  if (typeof document === 'undefined') {
    return value;
  }
  const helper = document.createElement('div');
  helper.style.color = value;
  document.body.appendChild(helper);
  const computed = getComputedStyle(helper).color;
  helper.remove();
  return computed || value;
}

export interface AudioWaveformProps extends Omit<BoxProps, 'onClick'> {
  /** Height of the waveform canvas in pixels. Default `64`. */
  height?: number;

  /** Gap between bars in pixels. Default `2`. */
  barGap?: number;

  /** Bar width in pixels. If undefined, bars expand to fill the canvas based on peaks length. */
  barWidth?: number;

  /** Border radius applied to every bar in pixels. Default `1`. Set to `0` for square bars. */
  barRadius?: number;

  /** Border radius of the container. */
  radius?: MantineRadius | (string & {}) | number;

  /**
   * Override the bar color for the *played* portion independently of the parent
   * `<Audio>` color. Accepts any Mantine theme color or raw CSS color string.
   * Defaults to the parent player's `--audio-color`.
   */
  color?: MantineColor;

  /**
   * Render bars symmetrically around the vertical center (top + mirrored bottom).
   * Default `true` — gives the classic audio editor look. Set to `false` for a
   * bottom-anchored bar chart look.
   */
  mirror?: boolean;

  /**
   * Gap in pixels between the top half and the bottom half of each mirrored bar.
   * Default `0` (bars touch the centerline — continuous look like Audacity).
   * Increase to show a visible center divider.
   */
  mirrorGap?: number;

  /**
   * Click/drag on the waveform to seek. Default `true`. When `false`, the waveform is
   * purely decorative.
   */
  interactive?: boolean;

  /**
   * When `true`, keep the audio playing during a drag instead of pausing it. The user
   * hears short snippets of audio as the mouse moves across the waveform — classic
   * "scrub preview" found in audio editors. Default `false`.
   */
  scrubSound?: boolean;
}

export const AudioWaveform = forwardRef<HTMLDivElement, AudioWaveformProps>(
  (
    {
      height = 64,
      barGap = 2,
      barWidth,
      barRadius = 1,
      radius,
      color,
      mirror = true,
      mirrorGap = 0,
      interactive = true,
      scrubSound,
      ...others
    },
    ref
  ) => {
    const theme = useMantineTheme();
    const resolvedColor = color ? getThemeColor(color, theme) : null;
    const ctx = useAudioContext();
    const effectiveScrubSound = scrubSound ?? ctx.scrubSound;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    const [hovering, setHovering] = useState<number | null>(null);
    const draggingRef = useRef(false);
    const wasPlayingRef = useRef(false);
    const rafRef = useRef<number | null>(null);
    const renderRef = useRef<(progressRatio: number) => void>(() => {});
    const audioRef = ctx.audioRef;

    useEffect(() => {
      const el = containerRef.current;
      if (!el || typeof ResizeObserver === 'undefined') {
        return;
      }
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
        }
      });
      observer.observe(el);
      setWidth(el.getBoundingClientRect().width);
      return () => observer.disconnect();
    }, []);

    // Build the renderer once per layout/peaks change. The actual playhead position
    // is passed at call-time so we can drive it from RAF at 60fps without depending
    // on React state updates.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        renderRef.current = () => {};
        return;
      }
      const peaks = ctx.peaks;
      if (!peaks || peaks.length === 0 || width <= 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const c2 = canvas.getContext('2d');
        c2?.clearRect(0, 0, canvas.width, canvas.height);
        renderRef.current = () => {};
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const c = canvas.getContext('2d');
      if (!c) {
        renderRef.current = () => {};
        return;
      }
      c.scale(dpr, dpr);

      // Treat barWidth = 0/undefined as "auto" — bars expand to fill the canvas.
      const autoBarWidth = !barWidth || barWidth <= 0;
      const requestedBarWidth = autoBarWidth ? 2 : barWidth;
      const maxBars = Math.max(1, Math.floor((width + barGap) / (requestedBarWidth + barGap)));
      const totalBars = Math.min(peaks.length, maxBars);
      const effectiveBarWidth = autoBarWidth
        ? Math.max(1, (width - barGap * (totalBars - 1)) / totalBars)
        : barWidth;
      const peaksPerBar = peaks.length / totalBars;

      const rawPlayed =
        resolvedColor ||
        getComputedStyle(canvas).getPropertyValue('--audio-waveform-played-color').trim() ||
        '#228be6';
      const rawUnplayed =
        getComputedStyle(canvas).getPropertyValue('--audio-waveform-color').trim() ||
        'rgba(120, 120, 120, 0.4)';
      const playedColor = resolveCssColor(rawPlayed);
      const unplayedColor = resolveCssColor(rawUnplayed);

      // Pre-compute peak per bar (does not depend on playhead) so we can render
      // many times cheaply.
      const aggregated = new Float32Array(totalBars);
      for (let i = 0; i < totalBars; i += 1) {
        const sliceStart = Math.floor(i * peaksPerBar);
        const sliceEnd = Math.floor((i + 1) * peaksPerBar);
        let peak = 0;
        for (let k = sliceStart; k < sliceEnd; k += 1) {
          const v = peaks[k] ?? 0;
          if (v > peak) {
            peak = v;
          }
        }
        aggregated[i] = peak;
      }

      const drawBar = (x: number, y: number, w: number, h: number, color: string) => {
        c.fillStyle = color;
        if (barRadius > 0 && typeof c.roundRect === 'function') {
          c.beginPath();
          (
            c as CanvasRenderingContext2D & {
              roundRect: (x: number, y: number, w: number, h: number, r: number) => void;
            }
          ).roundRect(x, y, w, h, Math.min(barRadius, w / 2, Math.max(0, h / 2)));
          c.fill();
        } else {
          c.fillRect(x, y, w, h);
        }
      };

      renderRef.current = (progressRatio: number) => {
        c.clearRect(0, 0, width, height);
        // Use a fractional played count so the colour transition tracks the
        // playhead at sub-bar precision.
        const playedFloat = progressRatio * totalBars;
        const playedBars = Math.floor(playedFloat);

        const center = height / 2;
        const halfGap = mirror ? mirrorGap / 2 : 0;

        for (let i = 0; i < totalBars; i += 1) {
          const peak = aggregated[i];
          const x = i * (effectiveBarWidth + barGap);
          const color = i < playedBars ? playedColor : unplayedColor;

          if (mirror) {
            // Two bars (top half + bottom half). With mirrorGap=0 they touch the
            // centerline producing a continuous shape; with mirrorGap>0 a visible
            // divider appears between them.
            const halfPeak = Math.max(1, peak * (center - halfGap));
            drawBar(x, center - halfGap - halfPeak, effectiveBarWidth, halfPeak, color);
            drawBar(x, center + halfGap, effectiveBarWidth, halfPeak, color);
          } else {
            // Single bar anchored to the bottom — classic bar chart look.
            const barHeight = Math.max(2, peak * height);
            drawBar(x, height - barHeight, effectiveBarWidth, barHeight, color);
          }
        }
      };

      // Initial render at current progress
      const duration = ctx.duration;
      const initial = duration > 0 ? (audioRef.current?.currentTime ?? 0) / duration : 0;
      renderRef.current(Math.max(0, Math.min(1, initial)));
    }, [ctx.peaks, width, height, barGap, barWidth, barRadius, mirror, mirrorGap, resolvedColor]);

    // RAF loop: when playing, re-render at 60fps reading the LIVE currentTime
    // directly off the <audio> element instead of waiting for `timeupdate` events
    // (which fire ~4Hz). When paused, snap one final frame to keep the played/unplayed
    // colors in sync with whatever the user just sought to.
    useEffect(() => {
      const tick = () => {
        const el = audioRef.current;
        const dur = el?.duration ?? 0;
        const t = el?.currentTime ?? 0;
        const ratio = dur > 0 ? Math.max(0, Math.min(1, t / dur)) : 0;
        renderRef.current(ratio);
        rafRef.current = requestAnimationFrame(tick);
      };

      if (ctx.playing) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Snap a single frame so the played/unplayed boundary matches the current
        // seek position without continuing to spin RAF.
        const dur = ctx.duration;
        const t = audioRef.current?.currentTime ?? 0;
        const ratio = dur > 0 ? Math.max(0, Math.min(1, t / dur)) : 0;
        renderRef.current(ratio);
      }

      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, [ctx.playing, ctx.duration, ctx.currentTime, audioRef]);

    const seekFromEvent = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        const el = containerRef.current;
        if (!el || ctx.duration <= 0) {
          return;
        }
        const rect = el.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        ctx.seek(ratio * ctx.duration);
      },
      [ctx]
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        const el = containerRef.current;
        if (!el) {
          return;
        }
        const rect = el.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        setHovering(ratio);
        if (draggingRef.current && interactive) {
          seekFromEvent(event);
        }
      },
      [interactive, seekFromEvent]
    );

    return (
      <Box
        ref={(node: HTMLDivElement | null) => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref && typeof ref === 'object') {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        {...ctx.getStyles('waveform')}
        style={{
          height,
          cursor: interactive ? 'pointer' : 'default',
          borderRadius: radius === undefined ? undefined : getRadius(radius),
        }}
        onMouseDown={(event) => {
          if (!interactive) {
            return;
          }
          draggingRef.current = true;
          wasPlayingRef.current = ctx.playing;
          if (effectiveScrubSound) {
            // scrubSound + paused → start playing to preview snippets while dragging.
            if (!ctx.playing) {
              ctx.play();
            }
          } else if (ctx.playing) {
            // scrubSound OFF → pause during drag.
            ctx.pause();
          }
          seekFromEvent(event);
        }}
        onMouseUp={() => {
          if (!draggingRef.current) {
            return;
          }
          draggingRef.current = false;
          // Restore pre-drag play state.
          if (effectiveScrubSound && !wasPlayingRef.current) {
            ctx.pause();
          } else if (!effectiveScrubSound && wasPlayingRef.current) {
            ctx.play();
          }
          wasPlayingRef.current = false;
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (draggingRef.current) {
            if (effectiveScrubSound && !wasPlayingRef.current) {
              ctx.pause();
            } else if (!effectiveScrubSound && wasPlayingRef.current) {
              ctx.play();
            }
          }
          draggingRef.current = false;
          wasPlayingRef.current = false;
          setHovering(null);
        }}
        data-loading={ctx.peaksLoading || undefined}
        data-error={ctx.peaksError ? 'true' : undefined}
        {...others}
      >
        <canvas ref={canvasRef} {...ctx.getStyles('waveformCanvas')} />
        {hovering !== null && interactive && (
          <Box
            {...ctx.getStyles('waveformHover')}
            style={{ left: `${hovering * 100}%` }}
            aria-hidden
          />
        )}
      </Box>
    );
  }
);

AudioWaveform.displayName = 'AudioWaveform';
