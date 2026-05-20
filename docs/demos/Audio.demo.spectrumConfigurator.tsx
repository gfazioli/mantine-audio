import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return (
    <Audio src="/audio/mozart.mp3" variant="floating" color="grape">
      <Audio.Spectrum{{props}} />
      <Audio.Controls />
    </Audio>
  );
}
`;

function Wrapper(props: any) {
  const a = useSampleAudio();
  return (
    <div style={{ maxWidth: 560 }}>
      <Audio src={a.mozart} variant="floating" color="grape">
        <Audio.Spectrum {...props} />
        <Audio.Controls />
      </Audio>
    </div>
  );
}

export const spectrumConfigurator: MantineDemo = {
  type: 'configurator',
  component: Wrapper,
  code,
  controls: [
    {
      prop: 'height',
      type: 'number',
      initialValue: 80,
      libraryValue: 64,
      min: 32,
      max: 120,
      step: 8,
    },
    {
      prop: 'barCount',
      type: 'number',
      initialValue: 48,
      libraryValue: 32,
      min: 8,
      max: 128,
      step: 4,
    },
    {
      prop: 'barGap',
      type: 'number',
      initialValue: 2,
      libraryValue: 2,
      min: 0,
      max: 10,
      step: 1,
    },
    {
      prop: 'barRadius',
      type: 'number',
      initialValue: 2,
      libraryValue: 2,
      min: 0,
      max: 12,
      step: 1,
    },
    {
      prop: 'smoothing',
      type: 'number',
      initialValue: 0.6,
      libraryValue: 0.6,
      min: 0,
      max: 0.95,
      step: 0.05,
    },
    {
      prop: 'color',
      type: 'color',
      initialValue: 'grape',
      libraryValue: 'blue',
    },
    {
      prop: 'colorMode',
      type: 'select',
      initialValue: 'gradient',
      libraryValue: 'solid',
      data: [
        { value: 'solid', label: 'solid' },
        { value: 'gradient', label: 'gradient' },
      ],
    },
    {
      prop: 'mirror',
      type: 'boolean',
      initialValue: false,
      libraryValue: false,
    },
  ],
};
