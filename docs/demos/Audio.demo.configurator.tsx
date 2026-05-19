import { Audio } from '@gfazioli/mantine-audio';
import { MantineDemo } from '@mantinex/demo';

const code = `
import { Audio } from '@gfazioli/mantine-audio';

function Demo() {
  return (
    <Audio src="/audio/showcase.mp3"{{props}}/>
  );
}
`;

function Wrapper(props: any) {
  return (
    <div style={{ maxWidth: 520 }}>
      <Audio src="/audio/showcase.mp3" {...props} />
    </div>
  );
}

export const configurator: MantineDemo = {
  type: 'configurator',
  component: Wrapper,
  code,
  controls: [
    {
      prop: 'variant',
      type: 'select',
      initialValue: 'overlay',
      data: [
        { value: 'overlay', label: 'overlay' },
        { value: 'minimal', label: 'minimal' },
        { value: 'floating', label: 'floating' },
        { value: 'bordered', label: 'bordered' },
      ],
      libraryValue: 'overlay',
    },
    {
      prop: 'color',
      type: 'color',
      initialValue: 'blue',
      libraryValue: 'blue',
    },
    {
      prop: 'radius',
      type: 'size',
      initialValue: 'md',
      libraryValue: 'md',
    },
    {
      prop: 'shortcuts',
      type: 'boolean',
      initialValue: true,
      libraryValue: true,
    },
  ],
};
