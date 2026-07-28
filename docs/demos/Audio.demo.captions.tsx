import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return (
    <Audio
      src="/audio/topcat.mp3"
      variant="floating"
      tracks={[
        { src: '/audio/topcat-en.vtt', srcLang: 'en', label: 'English', default: true },
      ]}
    >
      <Audio.Captions keepSpace placeholder="♪" />
      <Audio.Controls />
    </Audio>
  );
}
`;

function Demo() {
  const a = useSampleAudio();
  return (
    <div style={{ maxWidth: 560 }}>
      <Audio
        src={a.topcat}
        variant="floating"
        tracks={[{ src: a.topcatCaptions, srcLang: 'en', label: 'English', default: true }]}
      >
        <Audio.Captions keepSpace placeholder="♪" />
        <Audio.Controls />
      </Audio>
    </div>
  );
}

export const captions: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
