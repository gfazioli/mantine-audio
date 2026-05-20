import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return (
    <Audio src="/audio/mozart.mp3" variant="floating" color="grape">
      <Audio.Spectrum height={80} barCount={48} colorMode="gradient" />
      <Audio.Controls />
    </Audio>
  );
}
`;

function Demo() {
  const a = useSampleAudio();
  return (
    <div style={{ maxWidth: 560 }}>
      <Audio src={a.mozart} variant="floating" color="grape">
        <Audio.Spectrum height={80} barCount={48} colorMode="gradient" />
        <Audio.Controls />
      </Audio>
    </div>
  );
}

export const spectrum: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
