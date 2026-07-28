import { getCaptionTracks, isCaptionsActive, readActiveCueText } from './captions';

const track = (kind: string, mode: string, cues: string[] = []) => ({
  kind,
  mode,
  activeCues: cues.map((text) => ({ text })),
});

describe('getCaptionTracks', () => {
  it('keeps captions and subtitles and drops the other kinds', () => {
    const tracks = getCaptionTracks([
      track('captions', 'hidden'),
      track('subtitles', 'disabled'),
      track('descriptions', 'hidden'),
      track('chapters', 'hidden'),
      track('metadata', 'hidden'),
    ]);

    expect(tracks.map((t) => t.kind)).toEqual(['captions', 'subtitles']);
  });

  it('returns an empty array for a missing or non-list value', () => {
    expect(getCaptionTracks(null)).toEqual([]);
    expect(getCaptionTracks(undefined)).toEqual([]);
    // jsdom hands back an object with no `length` at all — it must not throw.
    expect(getCaptionTracks({} as any)).toEqual([]);
  });

  it('accepts a live TextTrackList, which is array-like but not an array', () => {
    const list = { 0: track('captions', 'hidden'), length: 1 };
    expect(getCaptionTracks(list)).toHaveLength(1);
  });
});

describe('isCaptionsActive', () => {
  it('is false when every track is disabled', () => {
    expect(isCaptionsActive([track('captions', 'disabled'), track('subtitles', 'disabled')])).toBe(
      false
    );
  });

  it('is true for a hidden track — the mode we set ourselves', () => {
    expect(isCaptionsActive([track('captions', 'hidden')])).toBe(true);
  });

  it('is true for a showing track — the mode the browser sets from `default`', () => {
    expect(isCaptionsActive([track('captions', 'showing')])).toBe(true);
  });

  it('is false with no tracks at all', () => {
    expect(isCaptionsActive([])).toBe(false);
  });
});

describe('readActiveCueText', () => {
  it('returns the active cue text', () => {
    expect(readActiveCueText([track('captions', 'hidden', ['A gentle piano melody'])])).toBe(
      'A gentle piano melody'
    );
  });

  it('joins simultaneous cues in document order', () => {
    // WebVTT allows overlapping cues, e.g. a speaker label alongside the line of dialogue.
    expect(
      readActiveCueText([track('captions', 'hidden', ['— Narrator:', 'and then it stopped'])])
    ).toBe('— Narrator:\nand then it stopped');
  });

  it('ignores disabled tracks, so a cue cannot leak through after captions are turned off', () => {
    expect(readActiveCueText([track('captions', 'disabled', ['should not show'])])).toBeNull();
  });

  it('returns null when no cue is active', () => {
    expect(readActiveCueText([track('captions', 'hidden', [])])).toBeNull();
  });

  it('drops empty and whitespace-only cues instead of rendering a blank box', () => {
    expect(readActiveCueText([track('captions', 'hidden', ['', '   ', '\n'])])).toBeNull();
  });

  it('trims surrounding whitespace from cue text', () => {
    expect(readActiveCueText([track('captions', 'hidden', ['  padded  '])])).toBe('padded');
  });

  it('survives a null activeCues, which is what a track reports before its cues load', () => {
    expect(readActiveCueText([{ kind: 'captions', mode: 'hidden', activeCues: null }])).toBeNull();
  });
});
