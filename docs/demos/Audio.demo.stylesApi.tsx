import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';
import { AudioStylesApi } from '../styles-api/Audio.styles-api';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return <Audio src="/audio/showcase.mp3"{{props}} />;
}
`;

function Demo(props: any) {
  const a = useSampleAudio();
  return <Audio src={a.showcase} {...props} />;
}

export const stylesApi: MantineDemo = {
  type: 'styles-api',
  data: AudioStylesApi,
  component: Demo,
  code,
  centered: true,
  maxWidth: 560,
};
