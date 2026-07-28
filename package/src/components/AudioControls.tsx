import { Box, type BoxProps } from '@mantine/core';
import React, { forwardRef, type ReactNode } from 'react';
import { useAudioContext } from '../Audio.context';
import { AudioCaptionsButton } from './AudioCaptionsButton';
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
              {/* Renders nothing unless the player was given a caption track, so adding it to the
                  default bar cannot leave a dead button on players that have none. */}
              <AudioCaptionsButton />
            </>
          )}
        </Box>
      </Box>
    );
  }
);

AudioControls.displayName = 'AudioControls';
