import { Text, type TextProps } from '@mantine/core';
import React, { forwardRef } from 'react';
import { useAudioContext } from '../Audio.context';

export type AudioTimeDisplayFormat =
  | 'current'
  | 'duration'
  | 'remaining'
  | 'current/duration'
  | 'current/-remaining';

export interface AudioTimeDisplayProps extends TextProps {
  /** Display format. Default `'current/duration'`. */
  format?: AudioTimeDisplayFormat;
}

export const AudioTimeDisplay = forwardRef<HTMLParagraphElement, AudioTimeDisplayProps>(
  ({ format = 'current/duration', ...others }, ref) => {
    const ctx = useAudioContext();
    const value = formatByMode(format, ctx.currentTime, ctx.duration);

    return (
      <Text
        ref={ref}
        size="sm"
        ff="monospace"
        ta="center"
        {...ctx.getStyles('timeDisplay')}
        {...others}
      >
        {value}
      </Text>
    );
  }
);

AudioTimeDisplay.displayName = 'AudioTimeDisplay';

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

function formatByMode(mode: AudioTimeDisplayFormat, current: number, duration: number): string {
  switch (mode) {
    case 'current':
      return formatTime(current);
    case 'duration':
      return formatTime(duration);
    case 'remaining':
      return formatTime(Math.max(duration - current, 0));
    case 'current/-remaining':
      return `${formatTime(current)} / -${formatTime(Math.max(duration - current, 0))}`;
    case 'current/duration':
    default:
      return `${formatTime(current)} / ${formatTime(duration)}`;
  }
}
