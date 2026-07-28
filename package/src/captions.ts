/**
 * Text-track helpers shared by `useAudio`, `Audio.Captions` and `Audio.CaptionsButton`.
 *
 * These are plain functions on purpose. jsdom stubs the TextTrack API — `audio.textTracks.length`
 * stays `0` even with a `<track>` in the DOM, `textTracks.addEventListener` is `undefined` and
 * `trackElement.track` is `undefined` — so cue logic driven through the DOM cannot be tested there.
 * Keeping the derivation pure means the interesting parts (which kinds count, how several
 * simultaneous cues combine, what "enabled" means) are covered by real unit tests instead of being
 * verified only by eye in a browser.
 */

/** Track kinds that carry text meant to be read by the listener. */
const CAPTION_KINDS = ['captions', 'subtitles'] as const;

/**
 * A structurally-typed slice of `TextTrack`. Widening the input this way is what lets the tests
 * pass literal objects, and it also tolerates partial implementations at runtime.
 */
export interface CaptionTrackLike {
  kind: string;
  mode: string;
  /**
   * Deliberately `unknown` rather than a cue type. The DOM's `TextTrackCue` base interface does not
   * declare `text` — only `VTTCue` does — so a `TextTrackCueList` is not assignable to any shape
   * mentioning it, even though the cues parsed from a `.vtt` file are `VTTCue` at runtime. The
   * narrowing happens in `cueText` instead of being asserted in the type.
   */
  activeCues?: ArrayLike<unknown> | null;
}

/** Reads a cue's text, tolerating cue kinds that carry none (`chapters`, `metadata`). */
function cueText(cue: unknown): string {
  if (
    cue !== null &&
    typeof cue === 'object' &&
    typeof (cue as { text?: unknown }).text === 'string'
  ) {
    return (cue as { text: string }).text.trim();
  }
  return '';
}

/** Keeps only the tracks whose kind is `captions` or `subtitles`. */
export function getCaptionTracks<T extends CaptionTrackLike>(
  list: ArrayLike<T> | null | undefined
): T[] {
  if (!list || typeof list.length !== 'number') {
    return [];
  }
  return Array.from(list).filter((track) =>
    (CAPTION_KINDS as readonly string[]).includes(track.kind)
  );
}

/**
 * True when at least one caption track is active.
 *
 * Both `'hidden'` and `'showing'` count: a track carrying the `default` attribute is put in
 * `'showing'` by the browser at load time, while a track we enable ourselves is put in `'hidden'`
 * (see `enableCaptions`). Only `'disabled'` means off — that is the mode where the browser stops
 * firing `cuechange` altogether.
 */
export function isCaptionsActive(tracks: readonly CaptionTrackLike[]): boolean {
  return tracks.some((track) => track.mode !== 'disabled');
}

/**
 * The text of every cue currently active across the enabled caption tracks, or `null` when there is
 * nothing to show.
 *
 * Cues can legitimately overlap (a speaker label plus a line of dialogue, two people talking), and
 * WebVTT allows several to be active at the same instant, so they are joined with a newline in
 * document order rather than picking one arbitrarily. Empty cues are dropped so they can never
 * produce a blank caption box.
 */
export function readActiveCueText(tracks: readonly CaptionTrackLike[]): string | null {
  const lines: string[] = [];

  for (const track of tracks) {
    if (track.mode === 'disabled' || !track.activeCues) {
      continue;
    }
    for (const cue of Array.from(track.activeCues)) {
      const text = cueText(cue);
      if (text) {
        lines.push(text);
      }
    }
  }

  return lines.length > 0 ? lines.join('\n') : null;
}
