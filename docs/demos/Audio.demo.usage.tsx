import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return <Audio src="/audio/showcase.mp3" />;
}
`;

function Demo() {
  const a = useSampleAudio();
  return (
    <div style={{ maxWidth: 520 }}>
      <Audio src={a.showcase} />
    </div>
  );
}

export const usage: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
