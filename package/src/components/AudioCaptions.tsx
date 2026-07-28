import { Box, type BoxProps, type ElementProps } from '@mantine/core';
import React, { forwardRef } from 'react';
import { useAudioContext } from '../Audio.context';

export interface AudioCaptionsProps extends BoxProps, ElementProps<'div'> {
  /**
   * Rendered while captions are enabled but no cue is active — between lines, or before playback
   * reaches the first one. Defaults to nothing, which keeps the layout from jumping.
   */
  placeholder?: React.ReactNode;

  /**
   * Keep the box in the layout when there is no cue to show, instead of unmounting it. Use this when
   * captions sit above a waveform and you would rather not have the surrounding content move as
   * lines come and go.
   */
  keepSpace?: boolean;
}

/**
 * Renders the currently active caption cue.
 *
 * This sub-component is not a convenience — it is the only thing that makes text tracks visible on
 * an audio player. A browser paints cues over a `<video>`, but an `<audio>` element has no surface
 * to paint on, so cue text supplied through the `tracks` prop reaches nobody until it is rendered as
 * DOM. Drop it anywhere inside `<Audio>`.
 *
 * The text is exposed as `activeCueText` by `useAudio` for consumers building their own UI.
 */
export const AudioCaptions = forwardRef<HTMLDivElement, AudioCaptionsProps>(
  ({ placeholder = null, keepSpace = false, ...others }, ref) => {
    const ctx = useAudioContext();
    const { activeCueText, captionsEnabled, hasCaptions } = ctx;

    if (!hasCaptions || !captionsEnabled) {
      return null;
    }

    const empty = activeCueText === null;

    if (empty && !keepSpace && placeholder === null) {
      return null;
    }

    return (
      <Box
        ref={ref}
        // A live region: cues replace one another while the listener's attention is elsewhere, so a
        // screen reader has to be told the text changed. `polite` waits for a pause rather than
        // interrupting, and `atomic` makes the whole line be read again instead of just the diff.
        aria-live="polite"
        aria-atomic="true"
        data-empty={empty || undefined}
        {...ctx.getStyles('captions')}
        {...others}
      >
        {empty ? placeholder : activeCueText}
      </Box>
    );
  }
);

AudioCaptions.displayName = 'AudioCaptions';
