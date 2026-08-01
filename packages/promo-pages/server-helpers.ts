export const noStoreHeaders = {
	'Cache-Control': 'no-store',
};

export const htmlResponse = (html: string) =>
	new Response(html, {
		headers: noStoreHeaders,
	});
