import {expect, test} from 'bun:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {Fieldset} from '../components/RenderModal/SchemaEditor/Fieldset';

const getParentStyleForTestId = (
	html: string,
	testId: string,
): string | null => {
	// The padded <div> is the parent of the div that carries data-testid.
	const match = html.match(
		new RegExp(`<div style="([^"]*)"><div data-testid="${testId}">`),
	);
	return match ? match[1] : null;
};

const paddingRight = (style: string | null): string | null => {
	if (!style) {
		return null;
	}

	const match = style.match(/padding-right:\s*([^;\s]+)/);
	return match ? match[1] : null;
};

test('Fieldset resets AlreadyPaddedRightContext for children of a non-padded sibling', () => {
	// This mirrors the Studio Inspector: an outer padded container (e.g. an
	// object) holds an array and a following non-padded wrapper. Before the fix,
	// the inner control after the array inherited the outer context and skipped
	// its right padding, causing it to appear shifted.
	const html = renderToStaticMarkup(
		<Fieldset shouldPad>
			<Fieldset shouldPad>
				<div data-testid="first-array">first</div>
			</Fieldset>
			<Fieldset shouldPad={false}>
				<Fieldset shouldPad>
					<div data-testid="after-array">after</div>
				</Fieldset>
			</Fieldset>
		</Fieldset>,
	);

	expect(paddingRight(getParentStyleForTestId(html, 'first-array'))).toBe('0');
	expect(paddingRight(getParentStyleForTestId(html, 'after-array'))).toBe(
		'6px',
	);
});

test('Fieldset keeps AlreadyPaddedRightContext for direct padded siblings', () => {
	const html = renderToStaticMarkup(
		<Fieldset shouldPad>
			<Fieldset shouldPad>
				<div data-testid="first-padded">first</div>
			</Fieldset>
			<Fieldset shouldPad>
				<div data-testid="second-padded">second</div>
			</Fieldset>
		</Fieldset>,
	);

	expect(paddingRight(getParentStyleForTestId(html, 'first-padded'))).toBe('0');
	expect(paddingRight(getParentStyleForTestId(html, 'second-padded'))).toBe(
		'0',
	);
});
