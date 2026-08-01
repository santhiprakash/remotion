import {serve} from 'bun';
import homepage from './homepage.html';
import promptsShow from './prompts-show.html';
import promptsSubmit from './prompts-submit.html';
import prompts from './prompts.html';
import team from './team.html';
import {htmlResponse} from './server-helpers';

const startingPort = 3000;
const maxPortAttempts = 100;


const startServer = () => {
	for (let port = startingPort; port < startingPort + maxPortAttempts; port++) {
		try {
			return serve({
				port,
				routes: {
					'/': htmlResponse(homepage),
					'/about': htmlResponse(team),
					'/prompts': htmlResponse(prompts),
					'/prompts/show': htmlResponse(promptsShow),
					'/prompts/submit': htmlResponse(promptsSubmit),
				},
				development: true,
				async fetch(req) {
					try {
						const url = new URL(req.url);
						const file = Bun.file(`./public${url.pathname}`);
						const exists = await file.exists();
						if (!exists) {
							return new Response('Not Found', {status: 404});
						}
						return new Response(file);
					} catch (e) {
						return new Response('Server Error', {status: 500});
					}
				},
			});
		} catch (error) {
			if (!(error instanceof Error)) {
				throw error;
			}

			const codedError = error as Error & {code: string};
			if (codedError.code !== 'EADDRINUSE') {
				throw error;
			}
		}
	}

	throw new Error(
		`Could not find a free port between ${startingPort} and ${startingPort + maxPortAttempts - 1}.`,
	);
};

const server = startServer();

console.log(`Listening on ${server.url}`);
