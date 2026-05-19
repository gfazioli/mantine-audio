import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return <Audio src="/audio/showcase.mp3" />;
}
`;

function Demo() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Audio src="/audio/showcase.mp3" />
    </div>
  );
}

export const usage: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
