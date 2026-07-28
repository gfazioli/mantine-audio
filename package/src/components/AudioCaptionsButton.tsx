import { ActionIcon, Tooltip, type ActionIconProps, type ElementProps } from '@mantine/core';
import { IconBadgeCc, IconBadgeCcFilled } from '@tabler/icons-react';
import React, { forwardRef } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioCaptionsButtonProps
  extends ActionIconProps, ElementProps<'button', keyof ActionIconProps | 'children'> {
  /** Tooltip and `aria-label` used while captions are off. */
  enableLabel?: string;

  /** Tooltip and `aria-label` used while captions are on. */
  disableLabel?: string;
}

/**
 * Toggles the caption tracks supplied through the `tracks` prop.
 *
 * Renders nothing when the player has no `captions` or `subtitles` track, so it can sit in a shared
 * control bar without leaving a dead button on players that have no captions.
 *
 * Pair it with `<Audio.Captions />`: this button only switches the tracks on and off, and on an
 * `<audio>` element nothing displays the cue text on its own.
 */
export const AudioCaptionsButton = forwardRef<HTMLButtonElement, AudioCaptionsButtonProps>(
  ({ enableLabel = 'Enable captions', disableLabel = 'Disable captions', ...others }, ref) => {
    const ctx = useAudioContext();
    const { hasCaptions, captionsEnabled, toggleCaptions } = ctx;

    if (!hasCaptions) {
      return null;
    }

    const label = captionsEnabled ? disableLabel : enableLabel;

    return (
      <Tooltip label={label} withArrow openDelay={400}>
        <ActionIcon
          ref={ref}
          variant="subtle"
          size="lg"
          aria-label={label}
          aria-pressed={captionsEnabled}
          onClick={toggleCaptions}
          data-state={captionsEnabled ? 'on' : 'off'}
          {...ctx.getStyles('captionsButton')}
          {...others}
        >
          {captionsEnabled ? <IconBadgeCcFilled size={18} /> : <IconBadgeCc size={18} />}
        </ActionIcon>
      </Tooltip>
    );
  }
);

AudioCaptionsButton.displayName = 'AudioCaptionsButton';
