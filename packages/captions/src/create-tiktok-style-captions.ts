import type {Caption} from './caption';

export type TikTokToken = {
	text: string;
	fromMs: number;
	toMs: number;
};

export type TikTokPage = {
	text: string;
	startMs: number;
	tokens: TikTokToken[];
	durationMs: number;
};

export type CreateTikTokStyleCaptionsInput = {
	captions: Caption[];
	combineTokensWithinMilliseconds: number;
};

export type CreateTikTokStyleCaptionsOutput = {
	pages: TikTokPage[];
};

export const createTikTokStyleCaptions = ({
	captions,
	combineTokensWithinMilliseconds,
}: CreateTikTokStyleCaptionsInput): CreateTikTokStyleCaptionsOutput => {
	// Some speech APIs (Deepgram, AssemblyAI) emit bare words without leading
	// spaces, while Whisper emits them space-prefixed. Detect the convention
	// so bare-word input gets spaces inserted between words for correct paging.
	const hasLeadingSpace = captions.some((c) => c.text.startsWith(' '));

	const tikTokStyleCaptions: TikTokPage[] = [];
	let currentText = '';
	let currentTokens: TikTokToken[] = [];
	let currentFrom = 0;
	let currentTo = 0;

	const add = () => {
		tikTokStyleCaptions.push({
			text: currentText.trimStart(),
			startMs: currentFrom,
			tokens: currentTokens,
			durationMs: Infinity,
		});
		if (tikTokStyleCaptions.length > 1) {
			tikTokStyleCaptions[tikTokStyleCaptions.length - 2].durationMs =
				currentFrom -
				tikTokStyleCaptions[tikTokStyleCaptions.length - 2].startMs;
		}
	};

	captions.forEach((item, index) => {
		let text = item.text;

		// If input has no leading-space convention, prepend a space to
		// subsequent captions so the page-breaking logic works correctly.
		if (!hasLeadingSpace && index > 0) {
			text = ' ' + text;
		}

		// If text starts with a space, push the currentText (if it exists) and start a new one
		if (
			text.startsWith(' ') &&
			currentTo - currentFrom > combineTokensWithinMilliseconds
		) {
			if (currentText !== '') {
				add();
			}

			// Start a new sentence
			currentText = text.trimStart();
			currentTokens = [
				{text: currentText, fromMs: item.startMs, toMs: item.endMs},
			].filter((t) => t.text !== '');
			currentFrom = item.startMs;
			currentTo = item.endMs;
		} else {
			// Continuation or start of a new sentence without leading space
			if (currentText === '') {
				// It's the start of the document or after a sentence that started with a space
				currentFrom = item.startMs;
			}

			currentText += text;
			currentText = currentText.trimStart();
			if (text.trim() !== '') {
				currentTokens.push({
					text: currentTokens.length === 0 ? currentText.trimStart() : text,
					fromMs: item.startMs,
					toMs: item.endMs,
				});
			}

			currentTo = item.endMs;
		}

		// Ensure the last sentence is added
		if (index === captions.length - 1 && currentText !== '') {
			add();

			tikTokStyleCaptions[tikTokStyleCaptions.length - 1].durationMs =
				currentTo - tikTokStyleCaptions[tikTokStyleCaptions.length - 1].startMs;
		}
	});

	// Fix any page that still has Infinity duration (e.g. caused by a trailing
	// whitespace-only caption that prevented the final add() call).
	// Use the page's own token timestamps rather than currentTo, which may
	// have been shifted by the trailing whitespace-only caption.
	if (
		tikTokStyleCaptions.length > 0 &&
		tikTokStyleCaptions[tikTokStyleCaptions.length - 1].durationMs === Infinity
	) {
		const lastPage = tikTokStyleCaptions[tikTokStyleCaptions.length - 1];
		const lastTokenEnd =
			lastPage.tokens.length > 0
				? lastPage.tokens[lastPage.tokens.length - 1].toMs
				: lastPage.startMs;
		lastPage.durationMs = lastTokenEnd - lastPage.startMs;
	}

	return {pages: tikTokStyleCaptions};
};
