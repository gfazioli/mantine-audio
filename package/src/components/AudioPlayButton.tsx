import { ActionIcon, Tooltip, type ActionIconProps, type ElementProps } from '@mantine/core';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import React, { forwardRef } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioPlayButtonProps
  extends ActionIconProps, ElementProps<'button', keyof ActionIconProps> {
  playLabel?: string;
  pauseLabel?: string;
}

export const AudioPlayButton = forwardRef<HTMLButtonElement, AudioPlayButtonProps>(
  ({ playLabel = 'Play', pauseLabel = 'Pause', ...others }, ref) => {
    const ctx = useAudioContext();
    const label = ctx.playing ? pauseLabel : playLabel;

    return (
      <Tooltip label={label} withArrow openDelay={400}>
        <ActionIcon
          ref={ref}
          variant="filled"
          color="var(--audio-color)"
          radius="xl"
          aria-label={label}
          onClick={ctx.toggle}
          data-state={ctx.playing ? 'playing' : 'paused'}
          {...ctx.getStyles('playButton', {
            style: { width: 'var(--audio-play-size)', height: 'var(--audio-play-size)' },
          })}
          {...others}
        >
          {ctx.playing ? (
            <IconPlayerPauseFilled
              style={{ width: 'var(--audio-icon-size)', height: 'var(--audio-icon-size)' }}
            />
          ) : (
            <IconPlayerPlayFilled
              style={{ width: 'var(--audio-icon-size)', height: 'var(--audio-icon-size)' }}
            />
          )}
        </ActionIcon>
      </Tooltip>
    );
  }
);

AudioPlayButton.displayName = 'AudioPlayButton';
