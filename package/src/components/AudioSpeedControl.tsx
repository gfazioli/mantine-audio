import { Menu, UnstyledButton, type MenuProps } from '@mantine/core';
import React, { forwardRef } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioSpeedControlProps {
  /** Available playback speeds. Default `[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]`. */
  speeds?: number[];

  /** Mantine Menu props forwarded to the underlying Menu */
  menuProps?: Partial<MenuProps>;
}

const DEFAULT_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const AudioSpeedControl = forwardRef<HTMLButtonElement, AudioSpeedControlProps>(
  ({ speeds = DEFAULT_SPEEDS, menuProps }, ref) => {
    const ctx = useAudioContext();
    const formatted = ctx.playbackRate === 1 ? '1×' : `${ctx.playbackRate}×`;

    return (
      <Menu shadow="md" width={120} position="top" {...menuProps}>
        <Menu.Target>
          <UnstyledButton
            ref={ref}
            aria-label={`Playback speed (${formatted})`}
            data-state={ctx.playbackRate === 1 ? 'normal' : 'custom'}
            {...ctx.getStyles('speedControl')}
          >
            {formatted}
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Playback speed</Menu.Label>
          {speeds.map((speed) => (
            <Menu.Item
              key={speed}
              onClick={() => ctx.setPlaybackRate(speed)}
              data-active={speed === ctx.playbackRate}
              fw={speed === ctx.playbackRate ? 600 : 400}
            >
              {speed === 1 ? 'Normal' : `${speed}×`}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }
);

AudioSpeedControl.displayName = 'AudioSpeedControl';
