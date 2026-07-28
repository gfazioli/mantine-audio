import { generateDeclarations } from 'mantine-docgen-script';
import path from 'path';

const getComponentPath = (componentPath: string) =>
  path.join(process.cwd(), 'package/src', componentPath);

generateDeclarations({
  componentsPaths: [
    getComponentPath('Audio.tsx'),
    getComponentPath('components/AudioCaptions.tsx'),
    getComponentPath('components/AudioCaptionsButton.tsx'),
    getComponentPath('components/AudioControls.tsx'),
    getComponentPath('components/AudioPlayButton.tsx'),
    getComponentPath('components/AudioTimeline.tsx'),
    getComponentPath('components/AudioTimeDisplay.tsx'),
    getComponentPath('components/AudioMuteButton.tsx'),
    getComponentPath('components/AudioSkipButton.tsx'),
    getComponentPath('components/AudioVolumeSlider.tsx'),
    getComponentPath('components/AudioSpeedControl.tsx'),
    getComponentPath('components/AudioWaveform.tsx'),
    getComponentPath('components/AudioSpectrum.tsx'),
  ],
  tsConfigPath: path.join(process.cwd(), 'tsconfig.json'),
  outputPath: path.join(process.cwd(), 'docs'),
});
