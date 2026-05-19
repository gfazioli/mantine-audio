import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return (
    <Audio src="/audio/topcat.mp3" variant="floating">
      <Audio.Waveform height={80} />
      <Audio.Controls />
    </Audio>
  );
}
`;

function Demo() {
  return (
    <div style={{ maxWidth: 560 }}>
      <Audio src="/audio/topcat.mp3" variant="floating">
        <Audio.Waveform height={80} />
        <Audio.Controls />
      </Audio>
    </div>
  );
}

export const waveform: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
