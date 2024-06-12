import type { IncomingMessage, ServerResponse } from 'node:http';
import type OpenApiServer from './OpenApiServer.js';

export default function ApplyCors(
	server: OpenApiServer,
	message: IncomingMessage,
	res: ServerResponse
) {
	const { origin } = message.headers;

	if (!origin) {
		return;
	}

	if (server.allowedOrigins.some((allowed) => allowed.test(origin))) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}
}
