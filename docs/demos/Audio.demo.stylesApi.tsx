import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';
import { AudioStylesApi } from '../styles-api/Audio.styles-api';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return <Audio src="/audio/showcase.mp3"{{props}} />;
}
`;

function Demo(props: any) {
  return <Audio src="/audio/showcase.mp3" {...props} />;
}

export const stylesApi: MantineDemo = {
  type: 'styles-api',
  data: AudioStylesApi,
  component: Demo,
  code,
  centered: true,
  maxWidth: 560,
};
