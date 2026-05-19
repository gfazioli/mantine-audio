import { render, screen } from '@mantine-tests/core';
import React from 'react';
import { Audio } from './Audio';

describe('Audio', () => {
  it('renders without crashing', () => {
    render(<Audio data-testid="audio" />);
    expect(screen.getByTestId('audio')).toBeInTheDocument();
  });

  it('renders the native <audio> element', () => {
    const { container } = render(<Audio src="https://example.com/song.mp3" />);
    const el = container.querySelector('audio');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('src')).toBe('https://example.com/song.mp3');
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Audio ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies variant data attribute', () => {
    render(<Audio data-testid="audio" variant="minimal" />);
    expect(screen.getByTestId('audio')).toHaveAttribute('data-variant', 'minimal');
  });

  it('applies as-background data attribute', () => {
    render(<Audio data-testid="audio" asBackground />);
    expect(screen.getByTestId('audio')).toHaveAttribute('data-as-background');
  });

  it('exposes the full compound API as static properties', () => {
    expect(Audio.Controls).toBeDefined();
    expect(Audio.PlayButton).toBeDefined();
    expect(Audio.Timeline).toBeDefined();
    expect(Audio.TimeDisplay).toBeDefined();
    expect(Audio.MuteButton).toBeDefined();
    expect(Audio.SkipButton).toBeDefined();
    expect(Audio.VolumeSlider).toBeDefined();
    expect(Audio.SpeedControl).toBeDefined();
    expect(Audio.Waveform).toBeDefined();
    expect(Audio.Spectrum).toBeDefined();
  });

  it('renders the default control bar when controls is not set to false', () => {
    const { container } = render(<Audio src="https://example.com/song.mp3" />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('does not render default controls when controls={false}', () => {
    const { container } = render(<Audio src="https://example.com/song.mp3" controls={false} />);
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('renders one <source> child per entry when `sources` is set, and omits the src attribute', () => {
    const { container } = render(
      <Audio
        sources={[
          { src: '/track.aac', type: 'audio/aac' },
          { src: '/track.ogg', type: 'audio/ogg' },
          { src: '/track.mp3', type: 'audio/mpeg' },
        ]}
      />
    );
    const audio = container.querySelector('audio');
    const sources = container.querySelectorAll('source');
    expect(sources.length).toBe(3);
    expect(sources[0].getAttribute('src')).toBe('/track.aac');
    expect(sources[0].getAttribute('type')).toBe('audio/aac');
    expect(sources[2].getAttribute('type')).toBe('audio/mpeg');
    // When `sources` is in play, `src` attribute is not set on the <audio> element.
    expect(audio?.hasAttribute('src')).toBe(false);
  });

  it('warns in dev when both src and sources are set', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Audio src="/x.mp3" sources={[{ src: '/y.mp3', type: 'audio/mpeg' }]} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Both `src` and `sources`'));
    warn.mockRestore();
  });
});
