import { AudioFactory } from '@gfazioli/mantine-audio';
import type { StylesApiData } from '../components/styles-api.types';

export const AudioStylesApi: StylesApiData<AudioFactory> = {
  selectors: {
    root: 'Root element (the player container)',
    audio: 'Hidden native <audio> element',
    controls: 'Controls wrapper holding the control bar',
    controlBar: 'Horizontal control bar inside the controls wrapper',
    playButton: 'Play / pause toggle button',
    timeline: 'Timeline (seek bar) container',
    timelineBuffered: 'Buffered range indicator over the timeline',
    timeDisplay: 'Current time / duration text element',
    muteButton: 'Mute / unmute toggle button',
    skipButton: 'Forward / backward skip button',
    volumeSlider: 'Volume slider element (0–100%)',
    speedControl: 'Playback speed control trigger',
    waveform: 'Waveform visualisation container',
    waveformCanvas: '<canvas> element rendering the waveform bars',
    waveformHover: 'Vertical hover indicator line on the waveform',
    spectrum: 'Live spectrum analyser container',
    spectrumCanvas: '<canvas> element rendering the frequency bars',
    captions: 'Box rendering the active caption cue — no browser paints cues for `<audio>`',
    captionsButton: 'Toggle for the caption tracks; hidden when the player has none',
    backgroundMuteButton: 'Floating mute toggle rendered when `asBackground` is true',
  },

  vars: {
    root: {
      '--audio-color': 'Primary color used for the timeline fill, thumb and accents',
      '--audio-radius': 'Border radius of the player container',
      '--audio-bg': 'Background color of the player container',
      '--audio-text-color': 'Color of text elements inside the player',
      '--audio-timeline-color': 'Color of the played portion of the timeline',
      '--audio-timeline-thumb-color': 'Color of the timeline thumb',
      '--audio-waveform-color': 'Color of the unplayed waveform bars',
      '--audio-waveform-played-color': 'Color of the played waveform bars',
      '--audio-spectrum-bar-color': 'Color of the spectrum analyser bars',
    },
  },

  modifiers: [
    {
      modifier: 'data-variant',
      selector: 'root',
      value: 'overlay | minimal | floating | bordered',
      condition: 'Based on `variant` prop',
    },
    {
      modifier: 'data-playing',
      selector: 'root',
      condition: 'The player is currently playing',
    },
    {
      modifier: 'data-paused',
      selector: 'root',
      condition: 'The player is paused (and not ended)',
    },
    {
      modifier: 'data-ended',
      selector: 'root',
      condition: 'Playback has reached the end of the track',
    },
    {
      modifier: 'data-as-background',
      selector: 'root',
      condition: '`asBackground` prop is true',
    },
  ],
};
