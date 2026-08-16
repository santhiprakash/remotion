import {expect, test} from 'bun:test';
import type {Caption} from '../caption';
import {createTikTokStyleCaptions} from '../create-tiktok-style-captions';

// Bug 1: Captions without leading spaces should not merge into one page.
// Speech APIs like Deepgram/AssemblyAI emit bare words without leading spaces.
// See https://github.com/remotion-dev/remotion/issues/10476

test('Should separate pages for bare-word captions without leading spaces', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: 'hello',
				startMs: 0,
				endMs: 300,
				timestampMs: 0,
				confidence: null,
			},
			{
				text: 'there',
				startMs: 300,
				endMs: 600,
				timestampMs: 300,
				confidence: null,
			},
			{
				text: 'friend',
				startMs: 600,
				endMs: 900,
				timestampMs: 600,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 200,
	});

	// Each word should become a separate page, not merged into one
	expect(pages.length).toBe(3);
	expect(pages[0].text).toBe('hello');
	expect(pages[1].text).toBe('there');
	expect(pages[2].text).toBe('friend');
});

// Bug 2: durationMs: Infinity should not leak to the caller when a
// trailing whitespace-only caption prevents the final add() call.
// See https://github.com/remotion-dev/remotion/issues/10476

test('Should not leak Infinity durationMs with trailing whitespace caption', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: ' one',
				startMs: 0,
				endMs: 500,
				timestampMs: 0,
				confidence: null,
			},
			{
				text: ' two',
				startMs: 500,
				endMs: 1000,
				timestampMs: 500,
				confidence: null,
			},
			{
				text: ' ',
				startMs: 2000,
				endMs: 2000,
				timestampMs: 2000,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 200,
	});

	expect(pages.length).toBeGreaterThanOrEqual(1);
	for (const page of pages) {
		expect(page.durationMs).not.toBe(Infinity);
	}
	expect(pages[pages.length - 1].durationMs).toBe(500); // 1000 - 500
});

// Edge case: single caption (bare-word input)

test('Should handle a single bare-word caption', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [
			{
				text: 'hello',
				startMs: 0,
				endMs: 500,
				timestampMs: 0,
				confidence: null,
			},
		],
		combineTokensWithinMilliseconds: 200,
	});

	expect(pages.length).toBe(1);
	expect(pages[0].text).toBe('hello');
	expect(pages[0].durationMs).toBe(500);
});

// Edge case: empty input

test('Should handle empty captions array', () => {
	const {pages} = createTikTokStyleCaptions({
		captions: [],
		combineTokensWithinMilliseconds: 200,
	});

	expect(pages.length).toBe(0);
});
