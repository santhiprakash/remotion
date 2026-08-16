import {expect, test} from 'bun:test';
import type {Caption} from '../caption';
import {ensureMaxCharactersPerLine} from '../ensure-max-characters-per-line';

// Bug 3: splitWords should not emit phantom whitespace tokens from
// split(' ') on text with leading spaces (e.g. " Remotion's" → ['', "Remotion's"]).
// See https://github.com/remotion-dev/remotion/issues/10476

test('Should not emit phantom whitespace tokens from leading-space text', () => {
	const captions: Caption[] = [
		{
			confidence: 0.9,
			endMs: 900,
			startMs: 300,
			text: " Remotion's",
			timestampMs: 440,
		},
		{
			confidence: 0.95,
			endMs: 1260,
			startMs: 900,
			text: ' TikTok',
			timestampMs: 1080,
		},
	];

	const {segments} = ensureMaxCharactersPerLine({
		captions,
		maxCharsPerLine: 30,
	});

	// All tokens should have non-empty text
	for (const segment of segments) {
		for (const token of segment) {
			expect(token.text.trim()).not.toBe('');
		}
	}

	// Should produce 1 segment with 2 real tokens, not 3 with a phantom space
	expect(segments.length).toBe(1);
	expect(segments[0].length).toBe(2);
	expect(segments[0][0].text).toBe(" Remotion's");
	expect(segments[0][1].text).toBe(' TikTok');
});
