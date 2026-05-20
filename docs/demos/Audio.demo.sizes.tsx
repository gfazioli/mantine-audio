import { Audio } from '@gfazioli/mantine-audio';
import { Stack, Text } from '@mantine/core';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return (
    <>
      <Audio size="xs" src="/audio/showcase.mp3" />
      <Audio size="sm" src="/audio/showcase.mp3" />
      <Audio size="md" src="/audio/showcase.mp3" />
      <Audio size="lg" src="/audio/showcase.mp3" />
      <Audio size="xl" src="/audio/showcase.mp3" />
    </>
  );
}
`;

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

function Demo() {
  const a = useSampleAudio();
  return (
    <Stack gap="lg" maw={620}>
      {SIZES.map((s) => (
        <Stack key={s} gap={4}>
          <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
            size = {s}
          </Text>
          <Audio size={s} src={a.showcase} variant="bordered" />
        </Stack>
      ))}
    </Stack>
  );
}

export const sizes: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
