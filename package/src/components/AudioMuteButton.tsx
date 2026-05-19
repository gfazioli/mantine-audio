import { ActionIcon, Tooltip, type ActionIconProps, type ElementProps } from '@mantine/core';
import { IconVolume, IconVolume2, IconVolume3 } from '@tabler/icons-react';
import React, { forwardRef } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioMuteButtonProps
  extends ActionIconProps, ElementProps<'button', keyof ActionIconProps> {
  muteLabel?: string;
  unmuteLabel?: string;
}

export const AudioMuteButton = forwardRef<HTMLButtonElement, AudioMuteButtonProps>(
  ({ muteLabel = 'Mute', unmuteLabel = 'Unmute', ...others }, ref) => {
    const ctx = useAudioContext();
    const isMuted = ctx.muted || ctx.volume === 0;
    const label = isMuted ? unmuteLabel : muteLabel;

    const Icon = isMuted ? IconVolume3 : ctx.volume < 0.5 ? IconVolume2 : IconVolume;

    return (
      <Tooltip label={label} withArrow openDelay={400}>
        <ActionIcon
          ref={ref}
          variant="subtle"
          color="gray"
          aria-label={label}
          aria-pressed={isMuted}
          onClick={ctx.toggleMute}
          data-state={isMuted ? 'muted' : 'unmuted'}
          {...ctx.getStyles('muteButton', {
            style: { width: 'var(--audio-action-size)', height: 'var(--audio-action-size)' },
          })}
          {...others}
        >
          <Icon style={{ width: 'var(--audio-icon-size)', height: 'var(--audio-icon-size)' }} />
        </ActionIcon>
      </Tooltip>
    );
  }
);

AudioMuteButton.displayName = 'AudioMuteButton';
