import { Slider, type SliderProps } from '@mantine/core';
import React, { forwardRef, useCallback } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioVolumeSliderProps extends Omit<
  SliderProps,
  'value' | 'onChange' | 'min' | 'max' | 'step'
> {}

export const AudioVolumeSlider = forwardRef<HTMLDivElement, AudioVolumeSliderProps>(
  ({ ...others }, ref) => {
    const ctx = useAudioContext();
    const value = ctx.muted ? 0 : Math.round(ctx.volume * 100);

    const handleChange = useCallback(
      (v: number) => {
        ctx.setVolume(v / 100);
      },
      [ctx]
    );

    return (
      <Slider
        ref={ref}
        value={value}
        onChange={handleChange}
        min={0}
        max={100}
        step={1}
        label={(v) => `${v}%`}
        showLabelOnHover
        size="xs"
        aria-label="Volume"
        styles={{
          bar: { backgroundColor: 'var(--audio-color)' },
          thumb: {
            backgroundColor: 'var(--audio-color)',
            borderColor: 'var(--audio-color)',
            width: 'var(--audio-timeline-thumb-size)',
            height: 'var(--audio-timeline-thumb-size)',
          },
        }}
        {...ctx.getStyles('volumeSlider')}
        {...others}
      />
    );
  }
);

AudioVolumeSlider.displayName = 'AudioVolumeSlider';
