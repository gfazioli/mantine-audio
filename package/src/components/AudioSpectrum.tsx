import {
  Box,
  getRadius,
  getThemeColor,
  useMantineTheme,
  type BoxProps,
  type MantineColor,
  type MantineRadius,
} from '@mantine/core';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useAudioContext } from '../Audio.context';

// Canvas API requires fully-parsed color strings (rgb/hex), it does NOT understand
// `var(--my-var)`. Resolve any CSS value via a throwaway helper element.
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

export interface AudioSpectrumProps extends BoxProps {
  /** Height of the spectrum canvas in pixels. Default `64`. */
  height?: number;

  /** Number of frequency bars to display. Default `32`. */
  barCount?: number;

  /** Gap between bars in pixels. Default `2`. */
  barGap?: number;

  /** Border radius applied to every bar in pixels. Default `2`. Set to `0` for square bars. */
  barRadius?: number;

  /** Border radius of the container. */
  radius?: MantineRadius | (string & {}) | number;

  /**
   * Override the bar color independently of the parent `<Audio>` color. Accepts any
   * Mantine theme color name or raw CSS color string. Defaults to the parent player's
   * `--audio-spectrum-bar-color` (which in turn defaults to the parent `color` prop).
   */
  color?: MantineColor;

  /** Smoothing factor [0..1] applied between frames. Default `0.6`. */
  smoothing?: number;

  /**
   * Color mode:
   * - `'solid'` (alias `'primary'`) — every bar uses the same color
   * - `'gradient'` — vertical gradient from the bar color (top) to transparent (bottom)
   *
   * Default `'solid'`.
   */
  colorMode?: 'solid' | 'gradient' | 'primary';

  /**
   * Render bars symmetrically around the vertical center (top + mirrored bottom),
   * classic equalizer look. Default `false`.
   */
  mirror?: boolean;
}

export const AudioSpectrum = forwardRef<HTMLDivElement, AudioSpectrumProps>(
  (
    {
      height = 64,
      barCount = 32,
      barGap = 2,
      barRadius = 2,
      radius,
      color,
      smoothing = 0.6,
      colorMode = 'solid',
      mirror = false,
      ...others
    },
    ref
  ) => {
    const theme = useMantineTheme();
    const resolvedColor = color ? getThemeColor(color, theme) : null;
    const ctx = useAudioContext();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    const rafRef = useRef<number | null>(null);
    const smoothedRef = useRef<Float32Array | null>(null);

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

    useEffect(() => {
      const canvas = canvasRef.current;
      const analyser = ctx.analyser;
      if (!canvas || !analyser || width <= 0) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const c = canvas.getContext('2d');
      if (!c) {
        return;
      }
      c.scale(dpr, dpr);

      const bins = analyser.frequencyBinCount;
      const buffer = new Uint8Array(bins);
      if (!smoothedRef.current || smoothedRef.current.length !== barCount) {
        smoothedRef.current = new Float32Array(barCount);
      }

      const effectiveBarWidth = Math.max(1, (width - barGap * (barCount - 1)) / barCount);
      const cssVar = (name: string) => getComputedStyle(canvas).getPropertyValue(name).trim();

      const draw = () => {
        if (!ctx.playing) {
          const smoothed = smoothedRef.current;
          if (smoothed) {
            let allZero = true;
            for (let i = 0; i < smoothed.length; i += 1) {
              smoothed[i] *= smoothing * 0.9;
              if (smoothed[i] > 0.005) {
                allZero = false;
              } else {
                smoothed[i] = 0;
              }
            }
            renderFrame();
            if (allZero) {
              rafRef.current = null;
              return;
            }
            rafRef.current = requestAnimationFrame(draw);
            return;
          }
          rafRef.current = null;
          return;
        }

        analyser.getByteFrequencyData(buffer);
        const smoothed = smoothedRef.current!;
        // Distribute frequency bins proportionally across bars so no bins are
        // dropped when bins is not a multiple of barCount (e.g. 128 bins / 48
        // bars left the highest 32 bins unused with Math.floor).
        for (let i = 0; i < barCount; i += 1) {
          const start = Math.floor((i * bins) / barCount);
          const end = Math.floor(((i + 1) * bins) / barCount);
          const count = Math.max(1, end - start);
          let sum = 0;
          for (let j = start; j < end; j += 1) {
            sum += buffer[j] ?? 0;
          }
          const avg = sum / count / 255;
          smoothed[i] = smoothed[i] * smoothing + avg * (1 - smoothing);
        }

        renderFrame();
        rafRef.current = requestAnimationFrame(draw);
      };

      const drawBar = (
        x: number,
        y: number,
        w: number,
        h: number,
        fill: string | CanvasGradient
      ) => {
        c.fillStyle = fill;
        if (barRadius > 0 && typeof c.roundRect === 'function') {
          c.beginPath();
          (
            c as CanvasRenderingContext2D & {
              roundRect: (x: number, y: number, w: number, h: number, r: number) => void;
            }
          ).roundRect(x, y, w, h, Math.min(barRadius, w / 2, h / 2));
          c.fill();
        } else {
          c.fillRect(x, y, w, h);
        }
      };

      // Pre-resolve colors once per "build" of renderFrame (not per bar / per frame).
      const rawPrimary =
        resolvedColor ||
        cssVar('--audio-spectrum-bar-color') ||
        cssVar('--audio-color') ||
        '#228be6';
      const primary = resolveCssColor(rawPrimary);
      const fadeColor = resolveCssColor(cssVar('--audio-spectrum-bar-color-fade') || 'transparent');

      const renderFrame = () => {
        c.clearRect(0, 0, width, height);
        const smoothed = smoothedRef.current!;
        const halfHeight = height / 2;

        for (let i = 0; i < barCount; i += 1) {
          const value = smoothed[i] ?? 0;
          const x = i * (effectiveBarWidth + barGap);

          if (mirror) {
            const barHeight = Math.max(1, value * halfHeight);
            const topY = halfHeight - barHeight;
            const bottomY = halfHeight;
            let fill: string | CanvasGradient = primary;
            if (colorMode === 'gradient') {
              const g = c.createLinearGradient(0, topY, 0, halfHeight + barHeight);
              g.addColorStop(0, fadeColor);
              g.addColorStop(0.5, primary);
              g.addColorStop(1, fadeColor);
              fill = g;
            }
            drawBar(x, topY, effectiveBarWidth, barHeight, fill);
            drawBar(x, bottomY, effectiveBarWidth, barHeight, fill);
          } else {
            const barHeight = Math.max(2, value * height);
            const y = height - barHeight;
            let fill: string | CanvasGradient = primary;
            if (colorMode === 'gradient') {
              const g = c.createLinearGradient(0, y, 0, height);
              g.addColorStop(0, primary);
              g.addColorStop(1, fadeColor);
              fill = g;
            }
            drawBar(x, y, effectiveBarWidth, barHeight, fill);
          }
        }
      };

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(draw);
      }

      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, [
      ctx.analyser,
      ctx.playing,
      width,
      height,
      barCount,
      barGap,
      barRadius,
      smoothing,
      colorMode,
      mirror,
      resolvedColor,
    ]);

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
        {...ctx.getStyles('spectrum')}
        style={{ height, borderRadius: radius === undefined ? undefined : getRadius(radius) }}
        {...others}
      >
        <canvas ref={canvasRef} {...ctx.getStyles('spectrumCanvas')} />
      </Box>
    );
  }
);

AudioSpectrum.displayName = 'AudioSpectrum';
