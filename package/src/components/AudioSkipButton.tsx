import { ActionIcon, Tooltip, type ActionIconProps, type ElementProps } from '@mantine/core';
import {
  IconRewindBackward10,
  IconRewindBackward15,
  IconRewindBackward30,
  IconRewindForward10,
  IconRewindForward15,
  IconRewindForward30,
} from '@tabler/icons-react';
import React, { forwardRef } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioSkipButtonProps
  extends ActionIconProps, ElementProps<'button', keyof ActionIconProps | 'children'> {
  /** Seconds to skip. Negative = backward, positive = forward. Default `10`. */
  seconds?: number;

  /** Override the displayed icon */
  icon?: React.ReactNode;

  /** Tooltip label override */
  label?: string;
}

export const AudioSkipButton = forwardRef<HTMLButtonElement, AudioSkipButtonProps>(
  ({ seconds = 10, icon, label, ...others }, ref) => {
    const ctx = useAudioContext();
    const forward = seconds >= 0;
    const tooltip = label ?? `${forward ? 'Forward' : 'Back'} ${Math.abs(seconds)}s`;

    const abs = Math.abs(seconds);
    const iconStyle = { width: 'var(--audio-icon-size)', height: 'var(--audio-icon-size)' };
    const renderedIcon =
      icon ??
      (forward ? (
        abs >= 30 ? (
          <IconRewindForward30 style={iconStyle} />
        ) : abs >= 15 ? (
          <IconRewindForward15 style={iconStyle} />
        ) : (
          <IconRewindForward10 style={iconStyle} />
        )
      ) : abs >= 30 ? (
        <IconRewindBackward30 style={iconStyle} />
      ) : abs >= 15 ? (
        <IconRewindBackward15 style={iconStyle} />
      ) : (
        <IconRewindBackward10 style={iconStyle} />
      ));

    return (
      <Tooltip label={tooltip} withArrow openDelay={400}>
        <ActionIcon
          ref={ref}
          variant="subtle"
          color="gray"
          aria-label={tooltip}
          onClick={() => ctx.seekBy(seconds)}
          {...ctx.getStyles('skipButton', {
            style: { width: 'var(--audio-action-size)', height: 'var(--audio-action-size)' },
          })}
          {...others}
        >
          {renderedIcon}
        </ActionIcon>
      </Tooltip>
    );
  }
);

AudioSkipButton.displayName = 'AudioSkipButton';
