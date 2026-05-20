import { Audio } from '@gfazioli/mantine-audio';
import { Avatar, Box, Group, Stack, Text } from '@mantine/core';
import { MantineDemo } from '@mantinex/demo';
import { useSampleAudio } from '../lib/sample-audio';

const code = `
import { Audio } from '@gfazioli/mantine-audio';
import { Avatar, Group, Stack, Text } from '@mantine/core';

// 1. Inline chat message
<Audio size="xs" variant="minimal" src="/voice-message.mp3" />

// 2. Card with cover + waveform (podcast)
<Group wrap="nowrap" align="flex-start">
  <Avatar src="/cover.jpg" size={80} radius="md" />
  <Stack gap={4} style={{ flex: 1 }}>
    <Text fw={600}>Episode title</Text>
    <Text fz="xs" c="dimmed">Podcast name · 32:14</Text>
    <Audio size="sm" src="/episode.mp3">
      <Audio.Waveform height={48} />
      <Audio.Controls />
    </Audio>
  </Stack>
</Group>

// 3. Sticky mini player (place inside a fixed positioned wrapper)
<Audio size="sm" variant="minimal" src="/track.mp3" />

// 4. Studio scrub with big waveform + scrubSound
<Audio size="xl" src="/track.mp3" scrubSound>
  <Audio.Waveform height={120} mirrorGap={2} />
  <Audio.Controls />
</Audio>
`;

function Demo() {
  const a = useSampleAudio();
  return (
    <Stack gap="xl" maw={620}>
      {/* 1. Inline chat message */}
      <Stack gap={6}>
        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
          1. Inline message (chat / voice note)
        </Text>
        <Box
          p="xs"
          style={{
            background: 'light-dark(var(--mantine-color-blue-1), var(--mantine-color-blue-9))',
            borderRadius: 'var(--mantine-radius-lg)',
            borderBottomRightRadius: 4,
            maxWidth: 360,
            alignSelf: 'flex-end',
          }}
        >
          <Audio size="xs" variant="minimal" src={a.showcase} controls />
        </Box>
      </Stack>

      {/* 2. Podcast card with cover + waveform */}
      <Stack gap={6}>
        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
          2. Podcast card (cover + waveform)
        </Text>
        <Group
          wrap="nowrap"
          align="flex-start"
          p="md"
          style={{
            background: 'var(--mantine-color-default)',
            borderRadius: 'var(--mantine-radius-md)',
          }}
        >
          <Avatar size={72} radius="md" color="grape">
            🎙️
          </Avatar>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} lineClamp={1}>
              The Mantine Show — Episode #42
            </Text>
            <Text fz="xs" c="dimmed">
              Custom components without losing your mind
            </Text>
            <Box mt={6}>
              <Audio size="sm" src={a.topcat} variant="minimal" color="grape">
                <Audio.Waveform height={42} barRadius={2} />
                <Audio.Controls />
              </Audio>
            </Box>
          </Stack>
        </Group>
      </Stack>

      {/* 3. Mini sticky bar */}
      <Stack gap={6}>
        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
          3. Mini sticky bar (variant=minimal)
        </Text>
        <Box
          p="xs"
          style={{
            background: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
            borderTop: '1px solid var(--mantine-color-default-border)',
            borderRadius: 0,
          }}
        >
          <Audio size="sm" variant="minimal" src={a.showcase} color="teal" />
        </Box>
      </Stack>

      {/* 4. Studio scrub */}
      <Stack gap={6}>
        <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
          4. Studio scrub (large waveform + scrubSound)
        </Text>
        <Audio size="xl" src={a.topcat} variant="floating" scrubSound color="orange">
          <Audio.Waveform height={100} mirrorGap={2} barRadius={1} />
          <Audio.Controls />
        </Audio>
      </Stack>
    </Stack>
  );
}

export const useCases: MantineDemo = {
  type: 'code',
  component: Demo,
  code,
};
