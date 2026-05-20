import { Audio } from '@gfazioli/mantine-audio';
import { Group, Stack, Text } from '@mantine/core';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';

const code = `
import { Audio } from '@gfazioli/mantine-audio';
import { Group, Stack } from '@mantine/core';

// 1. Default — the built-in <Audio.Controls /> renders a horizontal row.
<Audio src="/track.mp3" />

// 2. Two-row — waveform on top, controls below.
<Audio src="/track.mp3">
  <Audio.Waveform height={48} />
  <Audio.Controls />
</Audio>

// 3. Vertical — every sub-component on its own row, controls grouped manually.
<Audio src="/track.mp3" controls={false}>
  <Stack gap="xs">
    <Audio.Waveform height={48} />
    <Audio.Timeline />
    <Group justify="space-between" wrap="nowrap">
      <Group gap="xs">
        <Audio.SkipButton seconds={-10} />
        <Audio.PlayButton />
        <Audio.SkipButton seconds={10} />
      </Group>
      <Audio.TimeDisplay />
      <Group gap="xs">
        <Audio.MuteButton />
        <Audio.VolumeSlider />
        <Audio.SpeedControl />
      </Group>
    </Group>
  </Stack>
</Audio>
`;

function Demo() {
  const a = useSampleAudio();
  return (
    <Stack gap="lg" maw={620}>
      <Stack gap={4}>
        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
          1. Default
        </Text>
        <Audio src={a.showcase} variant="bordered" />
      </Stack>

      <Stack gap={4}>
        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
          2. Two-row (waveform on top, controls below)
        </Text>
        <Audio src={a.topcat} variant="bordered">
          <Audio.Waveform height={48} />
          <Audio.Controls />
        </Audio>
      </Stack>

      <Stack gap={4}>
        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
          3. Vertical (manual layout with Stack + Group)
        </Text>
        <Audio src={a.showcase} variant="bordered" controls={false}>
          <Stack gap="xs">
            <Audio.Waveform height={48} />
            <Audio.Timeline />
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <Audio.SkipButton seconds={-10} />
                <Audio.PlayButton />
                <Audio.SkipButton seconds={10} />
              </Group>
              <Audio.TimeDisplay />
              <Group gap="xs">
                <Audio.MuteButton />
                <Audio.VolumeSlider />
                <Audio.SpeedControl />
              </Group>
            </Group>
          </Stack>
        </Audio>
      </Stack>
    </Stack>
  );
}

export const layouts: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
