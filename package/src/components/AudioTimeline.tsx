import { Box, Slider, type BoxProps, type SliderProps } from '@mantine/core';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioTimelineProps extends Omit<BoxProps, 'onChange'> {
  /** Slider props forwarded to the underlying Mantine Slider */
  sliderProps?: Partial<Omit<SliderProps, 'value' | 'onChange' | 'onChangeEnd' | 'max' | 'min'>>;

  /**
   * Live-scrub the audio while dragging the timeline thumb — the underlying `<audio>`
   * element seeks to the new position on every change. The player is paused for the
   * duration of the drag and resumes automatically on release if it was playing.
   * Default `true`.
   */
  liveScrub?: boolean;

  /**
   * When `true`, keep the audio playing during a live scrub instead of pausing it.
   * The user hears short snippets of audio as the thumb moves across the timeline
   * — classic "scrub preview" found in audio editors (Audacity, Adobe Audition).
   * Has no effect when `liveScrub={false}`. Default `false`.
   */
  scrubSound?: boolean;
}

export const AudioTimeline = forwardRef<HTMLDivElement, AudioTimelineProps>(
  ({ sliderProps, liveScrub = true, scrubSound, ...others }, ref) => {
    const ctx = useAudioContext();
    const effectiveScrubSound = scrubSound ?? ctx.scrubSound;
    const [scrubbing, setScrubbing] = useState<number | null>(null);
    const isScrubbingRef = useRef(false);
    const wasPlayingRef = useRef(false);
    const rafRef = useRef<number | null>(null);
    const pendingSeekRef = useRef<number | null>(null);

    const max = Number.isFinite(ctx.duration) && ctx.duration > 0 ? ctx.duration : 0;
    const value = scrubbing ?? ctx.currentTime;
    const bufferedPercent = max > 0 ? (ctx.buffered / max) * 100 : 0;

    useEffect(
      () => () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }
      },
      []
    );

    const handleChange = useCallback(
      (v: number) => {
        if (!isScrubbingRef.current) {
          isScrubbingRef.current = true;
          wasPlayingRef.current = ctx.playing;
          if (liveScrub) {
            if (effectiveScrubSound && !ctx.playing) {
              // scrubSound + paused → start playing so the user hears the snippet
              // while dragging. Will be paused again on release.
              ctx.play();
            } else if (!effectiveScrubSound && ctx.playing) {
              // scrubSound OFF → mute during drag.
              ctx.pause();
            }
          }
        }
        setScrubbing(v);

        if (!liveScrub) {
          return;
        }

        pendingSeekRef.current = v;
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (pendingSeekRef.current !== null) {
              ctx.seek(pendingSeekRef.current);
              pendingSeekRef.current = null;
            }
          });
        }
      },
      [ctx, liveScrub, effectiveScrubSound]
    );

    const handleChangeEnd = useCallback(
      (v: number) => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        pendingSeekRef.current = null;
        ctx.seek(v);
        setScrubbing(null);
        isScrubbingRef.current = false;
        // Restore the pre-drag play state.
        if (effectiveScrubSound && !wasPlayingRef.current) {
          // scrubSound + was paused before drag: we started playing on drag-start
          // to preview the audio, pause again to restore the original state.
          ctx.pause();
        } else if (!effectiveScrubSound && wasPlayingRef.current) {
          // scrubSound OFF + was playing before drag: we paused on drag-start, resume.
          ctx.play();
        }
        wasPlayingRef.current = false;
      },
      [ctx, effectiveScrubSound]
    );

    return (
      <Box ref={ref} {...ctx.getStyles('timeline')} {...others}>
        <Box
          {...ctx.getStyles('timelineBuffered')}
          style={{ width: `${bufferedPercent}%` }}
          aria-hidden
        />
        <Slider
          value={Math.min(value, max || value)}
          onChange={handleChange}
          onChangeEnd={handleChangeEnd}
          min={0}
          max={max || 0.0001}
          step={0.01}
          label={(v) => formatTime(v)}
          showLabelOnHover
          color="var(--audio-timeline-color)"
          size="xs"
          aria-label="Seek"
          styles={{
            root: { flex: 1, width: '100%' },
            bar: { backgroundColor: 'var(--audio-timeline-color)' },
            thumb: {
              backgroundColor: 'var(--audio-timeline-thumb-color)',
              borderColor: 'var(--audio-timeline-thumb-color)',
              width: 'var(--audio-timeline-thumb-size)',
              height: 'var(--audio-timeline-thumb-size)',
            },
          }}
          {...sliderProps}
        />
      </Box>
    );
  }
);

AudioTimeline.displayName = 'AudioTimeline';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
