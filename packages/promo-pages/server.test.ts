import {expect, test} from 'bun:test';
import {htmlResponse} from './server-helpers';

test('homepage html response is not cached', async () => {
	const response = htmlResponse('<!doctype html><html></html>');
	expect(response.headers.get('cache-control')).toBe('no-store');
	expect(await response.text()).toBe('<!doctype html><html></html>');
});
