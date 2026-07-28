import { render, screen, userEvent } from '@mantine-tests/core';
import React, { act } from 'react';
import { Audio } from './Audio';

/**
 * jsdom ships a stub of the TextTrack API: `audio.textTracks.length` stays `0` even with a `<track>`
 * in the DOM, `textTracks.addEventListener` is `undefined` and `trackElement.track` is `undefined`.
 * So the captions behaviour cannot be driven through real markup here — the element is given a fake
 * track list instead, installed on `HTMLMediaElement.prototype` before render so the mount effect
 * sees it.
 *
 * What that buys is coverage of the parts most likely to break: which mode a track is put in, that
 * the button and the cue renderer never disagree, and that a cue cannot leak through after captions
 * are switched off. What it cannot prove is that a browser actually fires `cuechange` — that is
 * verified against a real rendered player instead.
 */

type Cue = { text: string };

class FakeTextTrack {
  kind: string;
  mode: string;
  activeCues: Cue[] | null;
  private handlers = new Map<string, Set<() => void>>();

  constructor(kind = 'captions', mode = 'disabled', cues: Cue[] | null = null) {
    this.kind = kind;
    this.mode = mode;
    this.activeCues = cues;
  }

  addEventListener(type: string, fn: () => void) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(fn);
  }

  removeEventListener(type: string, fn: () => void) {
    this.handlers.get(type)?.delete(fn);
  }

  /** Simulates the browser advancing to a cue. */
  emitCueChange(cues: Cue[] | null) {
    this.activeCues = cues;
    act(() => {
      this.handlers.get('cuechange')?.forEach((fn) => fn());
    });
  }

  get listenerCount() {
    return this.handlers.get('cuechange')?.size ?? 0;
  }
}

/** Array-like, exactly as a live `TextTrackList` is — not an array. */
function fakeTrackList(tracks: FakeTextTrack[]) {
  const list: Record<string, unknown> = { length: tracks.length };
  tracks.forEach((track, index) => {
    list[index] = track;
  });
  list.addEventListener = () => {};
  list.removeEventListener = () => {};
  return list;
}

const originalDescriptor = Object.getOwnPropertyDescriptor(
  window.HTMLMediaElement.prototype,
  'textTracks'
);

function installTracks(tracks: FakeTextTrack[]) {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'textTracks', {
    configurable: true,
    get: () => fakeTrackList(tracks),
  });
}

afterEach(() => {
  if (originalDescriptor) {
    Object.defineProperty(window.HTMLMediaElement.prototype, 'textTracks', originalDescriptor);
  } else {
    delete (window.HTMLMediaElement.prototype as unknown as Record<string, unknown>).textTracks;
  }
});

describe('Audio tracks prop', () => {
  it('renders each entry as a <track> child of the <audio> element', () => {
    render(
      <Audio
        src="/a.mp3"
        tracks={[
          { src: '/en.vtt', srcLang: 'en', label: 'English', default: true },
          { src: '/it.vtt', kind: 'subtitles', srcLang: 'it', label: 'Italiano' },
        ]}
      />
    );

    // Inside the media element, not merely somewhere in the tree — `children` render outside it,
    // which is the whole reason this prop has to exist.
    const tracks = document.querySelectorAll('audio > track');
    expect(tracks).toHaveLength(2);

    expect(tracks[0].getAttribute('src')).toBe('/en.vtt');
    expect(tracks[0].getAttribute('srclang')).toBe('en');
    expect(tracks[0].getAttribute('label')).toBe('English');
    expect(tracks[0].hasAttribute('default')).toBe(true);

    expect(tracks[1].getAttribute('kind')).toBe('subtitles');
    expect(tracks[1].hasAttribute('default')).toBe(false);
  });

  it('defaults a track kind to captions', () => {
    render(<Audio src="/a.mp3" tracks={[{ src: '/en.vtt', srcLang: 'en' }]} />);
    expect(document.querySelector('audio > track')?.getAttribute('kind')).toBe('captions');
  });

  it('renders no track element when tracks is absent or empty', () => {
    const { unmount } = render(<Audio src="/a.mp3" />);
    expect(document.querySelectorAll('audio > track')).toHaveLength(0);
    unmount();

    render(<Audio src="/a.mp3" tracks={[]} />);
    expect(document.querySelectorAll('audio > track')).toHaveLength(0);
  });

  it('keeps the tracks alongside sources', () => {
    render(
      <Audio
        sources={[{ src: '/a.ogg', type: 'audio/ogg' }]}
        tracks={[{ src: '/en.vtt', srcLang: 'en' }]}
      />
    );
    expect(document.querySelectorAll('audio > source')).toHaveLength(1);
    expect(document.querySelectorAll('audio > track')).toHaveLength(1);
  });
});

describe('Audio.CaptionsButton', () => {
  it('renders nothing when the player has no text track', () => {
    render(<Audio src="/a.mp3" />);
    expect(screen.queryByLabelText(/captions/i)).toBeNull();
  });

  it('renders nothing when the only tracks are non-caption kinds', () => {
    installTracks([new FakeTextTrack('chapters'), new FakeTextTrack('metadata')]);
    render(<Audio src="/a.mp3" />);
    expect(screen.queryByLabelText(/captions/i)).toBeNull();
  });

  it('appears in the default control bar as soon as a caption track exists', () => {
    installTracks([new FakeTextTrack('captions')]);
    render(<Audio src="/a.mp3" />);

    const button = screen.getByLabelText('Enable captions');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('data-state')).toBe('off');
  });

  it('puts the track in `hidden` rather than `showing` when toggled on', async () => {
    // `hidden` keeps `cuechange` firing while telling the user agent not to draw anything, which is
    // what lets Audio.Captions own the rendering without any risk of a cue being painted twice.
    const track = new FakeTextTrack('captions');
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    await userEvent.click(screen.getByLabelText('Enable captions'));

    expect(track.mode).toBe('hidden');
    expect(screen.getByLabelText('Disable captions').getAttribute('aria-pressed')).toBe('true');
  });

  it('disables the track when toggled back off', async () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    await userEvent.click(screen.getByLabelText('Disable captions'));

    expect(track.mode).toBe('disabled');
    expect(screen.getByLabelText('Enable captions')).toBeTruthy();
  });

  it('treats a `default` track as already on, since the browser puts it in `showing`', () => {
    installTracks([new FakeTextTrack('captions', 'showing')]);
    render(<Audio src="/a.mp3" />);
    expect(screen.getByLabelText('Disable captions').getAttribute('aria-pressed')).toBe('true');
  });

  it('accepts custom labels', () => {
    installTracks([new FakeTextTrack('captions')]);
    render(
      <Audio src="/a.mp3" controls={false}>
        <Audio.CaptionsButton enableLabel="Sottotitoli" disableLabel="Nascondi" />
      </Audio>
    );
    expect(screen.getByLabelText('Sottotitoli')).toBeTruthy();
  });
});

describe('Audio.Captions', () => {
  it('renders the active cue text — nothing else on an <audio> element does', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    track.emitCueChange([{ text: 'A slow piano figure' }]);

    expect(screen.getByText('A slow piano figure')).toBeTruthy();
  });

  it('joins simultaneous cues on separate lines', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    track.emitCueChange([{ text: '— Narrator:' }, { text: 'and then it stopped' }]);

    expect(screen.getByText(/— Narrator:/)).toBeTruthy();
    expect(screen.getByText(/and then it stopped/)).toBeTruthy();
  });

  it('replaces the previous cue instead of accumulating', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    track.emitCueChange([{ text: 'first line' }]);
    track.emitCueChange([{ text: 'second line' }]);

    expect(screen.queryByText('first line')).toBeNull();
    expect(screen.getByText('second line')).toBeTruthy();
  });

  it('renders nothing while captions are disabled', () => {
    const track = new FakeTextTrack('captions', 'disabled', [{ text: 'must not show' }]);
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    expect(screen.queryByText('must not show')).toBeNull();
  });

  it('clears the cue when captions are switched off mid-line', async () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    track.emitCueChange([{ text: 'visible for now' }]);
    expect(screen.getByText('visible for now')).toBeTruthy();

    await userEvent.click(screen.getByLabelText('Disable captions'));

    expect(screen.queryByText('visible for now')).toBeNull();
  });

  it('is a polite live region, so a screen reader announces each new line', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(<Audio src="/a.mp3" />);

    track.emitCueChange([{ text: 'announce me' }]);

    const box = screen.getByText('announce me');
    expect(box.getAttribute('aria-live')).toBe('polite');
    expect(box.getAttribute('aria-atomic')).toBe('true');
  });

  it('collapses away between cues by default', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(
      <Audio src="/a.mp3" controls={false}>
        <Audio.Captions data-testid="cc" />
      </Audio>
    );

    track.emitCueChange([{ text: 'here' }]);
    expect(screen.getByTestId('cc')).toBeTruthy();

    track.emitCueChange(null);
    expect(screen.queryByTestId('cc')).toBeNull();
  });

  it('holds its space between cues when keepSpace is set', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(
      <Audio src="/a.mp3" controls={false}>
        <Audio.Captions keepSpace data-testid="cc" />
      </Audio>
    );

    track.emitCueChange(null);

    const box = screen.getByTestId('cc');
    expect(box.getAttribute('data-empty')).toBe('true');
    expect(box.textContent).toBe('');
  });

  it('shows a placeholder between cues when one is given', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    render(
      <Audio src="/a.mp3" controls={false}>
        <Audio.Captions placeholder="♪" />
      </Audio>
    );

    track.emitCueChange(null);

    expect(screen.getByText('♪')).toBeTruthy();
  });

  it('renders nothing at all when the player has no track', () => {
    render(
      <Audio src="/a.mp3" controls={false}>
        <Audio.Captions keepSpace data-testid="cc" />
      </Audio>
    );
    expect(screen.queryByTestId('cc')).toBeNull();
  });

  it('detaches its cuechange listener on unmount', () => {
    const track = new FakeTextTrack('captions', 'hidden');
    installTracks([track]);
    const { unmount } = render(<Audio src="/a.mp3" />);

    expect(track.listenerCount).toBe(1);
    unmount();
    expect(track.listenerCount).toBe(0);
  });
});

describe('Audio captions statics', () => {
  it('exposes the two new sub-components', () => {
    expect(Audio.Captions).toBeDefined();
    expect(Audio.CaptionsButton).toBeDefined();
  });
});
