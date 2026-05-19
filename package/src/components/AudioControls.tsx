import { Box, type BoxProps } from '@mantine/core';
import React, { forwardRef, type ReactNode } from 'react';
import { useAudioContext } from '../Audio.context';
import { AudioMuteButton } from './AudioMuteButton';
import { AudioPlayButton } from './AudioPlayButton';
import { AudioSpeedControl } from './AudioSpeedControl';
import { AudioTimeDisplay } from './AudioTimeDisplay';
import { AudioTimeline } from './AudioTimeline';
import { AudioVolumeSlider } from './AudioVolumeSlider';

export interface AudioControlsProps extends BoxProps {
  children?: ReactNode;
}

export const AudioControls = forwardRef<HTMLDivElement, AudioControlsProps>(
  ({ children, ...others }, ref) => {
    const ctx = useAudioContext();

    return (
      <Box ref={ref} {...ctx.getStyles('controls')} {...others}>
        <Box {...ctx.getStyles('controlBar')}>
          {children ?? (
            <>
              <AudioPlayButton />
              <AudioTimeline />
              <AudioTimeDisplay />
              <AudioMuteButton />
              <AudioVolumeSlider />
              <AudioSpeedControl />
            </>
          )}
        </Box>
      </Box>
    );
  }
);

AudioControls.displayName = 'AudioControls';
