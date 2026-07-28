import { defineConfig } from 'oxlint';
import { oxlint } from 'oxc-config-mantine';

export default defineConfig({
  ...oxlint,
  rules: {
    ...oxlint.rules,
    // Upstream ships `curly: 'error'` (defaults to "all" → braces always required), which
    // conflicts with oxfmt: the formatter collapses single-statement bodies onto the condition
    // line (`if (x) return;`), so a freshly-formatted file fails its own lint step.
    // "multi-line" allows exactly what oxfmt emits while still requiring braces for multi-line
    // bodies. Do not drop this override when bumping oxc-config-mantine.
    curly: ['error', 'multi-line'],
    // Repo-specific. Captions ARE supported as of 1.1.0: the `tracks` prop renders one <track> per
    // entry inside the <audio> element, `Audio.Captions` renders the active cue (a browser paints
    // nothing for audio — there is no picture to paint on) and `Audio.CaptionsButton` toggles them.
    // The rule still fires because it only inspects JSX statically and cannot see through the
    // `tracks.map(...)` that produces those children.
    //
    // Until 1.1.0 this warning was left visible on purpose, because it was *correct*: there was no
    // `tracks` prop and `children` render outside the media element, so captions were impossible.
    // Do not re-add that state by removing the prop.
    'jsx-a11y/media-has-caption': 'off',
  },
  // Upstream ignores 'docs/out' and 'package/dist' but not 'docs/.next', which our docs sites have.
  ignorePatterns: ['**/*.{mjs,cjs,js,d.ts,d.mts}', 'docs/.next', 'docs/out', 'package/dist'],
});
