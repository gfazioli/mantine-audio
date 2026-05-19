import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return (
    <Audio src="/audio/topcat.mp3" variant="floating"{{audioProps}}>
      <Audio.Waveform{{waveformProps}} />
      <Audio.Controls />
    </Audio>
  );
}
`;

function Wrapper(props: any) {
  // scrubSound goes on the parent <Audio> so it propagates to BOTH Timeline + Waveform
  const { scrubSound, ...waveformProps } = props;
  return (
    <div style={{ maxWidth: 560 }}>
      <Audio src="/audio/topcat.mp3" variant="floating" scrubSound={scrubSound}>
        <Audio.Waveform {...waveformProps} />
        <Audio.Controls />
      </Audio>
    </div>
  );
}

export const waveformConfigurator: MantineDemo = {
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
      initialValue: 1,
      libraryValue: 1,
      min: 0,
      max: 10,
      step: 1,
    },
    {
      prop: 'color',
      type: 'color',
      initialValue: 'blue',
      libraryValue: 'blue',
    },
    {
      prop: 'mirror',
      type: 'boolean',
      initialValue: true,
      libraryValue: true,
    },
    {
      prop: 'mirrorGap',
      type: 'number',
      initialValue: 0,
      libraryValue: 0,
      min: 0,
      max: 20,
      step: 1,
    },
    {
      prop: 'interactive',
      type: 'boolean',
      initialValue: true,
      libraryValue: true,
    },
    {
      prop: 'scrubSound',
      type: 'boolean',
      initialValue: false,
      libraryValue: false,
    },
  ],
};
