import { Stack, Text } from '@mantine/core';
import React from 'react';
import { Audio } from './Audio';

const SAMPLE_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export default {
  title: 'Components/Audio',
};

export function Default() {
  return (
    <Stack maw={520} gap="md">
      <Text fw={600}>Default player</Text>
      <Audio src={SAMPLE_URL} />
    </Stack>
  );
}

export function Variants() {
  return (
    <Stack maw={520} gap="lg">
      <div>
        <Text fw={600} mb={6}>
          overlay
        </Text>
        <Audio src={SAMPLE_URL} variant="overlay" />
      </div>
      <div>
        <Text fw={600} mb={6}>
          bordered
        </Text>
        <Audio src={SAMPLE_URL} variant="bordered" />
      </div>
      <div>
        <Text fw={600} mb={6}>
          floating
        </Text>
        <Audio src={SAMPLE_URL} variant="floating" />
      </div>
      <div>
        <Text fw={600} mb={6}>
          minimal
        </Text>
        <Audio src={SAMPLE_URL} variant="minimal" />
      </div>
    </Stack>
  );
}

export function WithWaveform() {
  return (
    <Stack maw={520} gap="md">
      <Text fw={600}>Player with waveform on top</Text>
      <Audio src={SAMPLE_URL} variant="floating">
        <Audio.Waveform />
        <Audio.Controls />
      </Audio>
    </Stack>
  );
}

export function WithSpectrum() {
  return (
    <Stack maw={520} gap="md">
      <Text fw={600}>Player with live spectrum analyser</Text>
      <Audio src={SAMPLE_URL} variant="floating">
        <Audio.Spectrum barCount={48} colorMode="gradient" />
        <Audio.Controls />
      </Audio>
    </Stack>
  );
}
