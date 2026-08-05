import {expect, test} from 'bun:test';
import {renderToString} from 'react-dom/server';
import {AbsoluteFill} from '../AbsoluteFill.js';

test('AbsoluteFill renders outside a composition', () => {
	const markup = renderToString(
		<AbsoluteFill className="layer" style={{backgroundColor: 'red'}}>
			Content
		</AbsoluteFill>,
	);

	expect(markup).toContain('Content');
	expect(markup).toContain('class="layer"');
	expect(markup).toContain('background-color:red');
});

test('AbsoluteFill renders in Studio outside a composition', () => {
	const previous = window.remotion_isStudio;
	window.remotion_isStudio = true;
	try {
		const markup = renderToString(
			<AbsoluteFill className="overlay" style={{backgroundColor: 'blue'}}>
				Modal
			</AbsoluteFill>,
		);

		expect(markup).toContain('Modal');
		expect(markup).toContain('class="overlay"');
		expect(markup).toContain('background-color:blue');
	} finally {
		window.remotion_isStudio = previous;
	}
});
