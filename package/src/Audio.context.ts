import type { GetStylesApi } from '@mantine/core';
import { createContext, useContext } from 'react';
import type { AudioFactory } from './Audio';
import type { UseAudioReturn } from './use-audio';

export interface AudioContextValue extends UseAudioReturn {
  getStyles: GetStylesApi<AudioFactory>;
  /** Default value of `scrubSound` propagated to child Timeline / Waveform. */
  scrubSound: boolean;
}

export const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider = AudioContext.Provider;

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error(
      'Audio compound component must be rendered inside an <Audio /> parent. ' +
        'If you need access to the audio state outside the <Audio /> tree, use the useAudio() hook instead.'
    );
  }
  return ctx;
}
