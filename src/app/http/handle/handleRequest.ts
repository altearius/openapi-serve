import type { IncomingMessage, ServerResponse } from 'node:http';
import ApplyCors from '../ApplyCors.js';
import type OpenApiServer from '../OpenApiServer.js';
import handleApiRequest from '../api/handle/handleApiRequest.js';
import handleStaticRoute from '../static/handleStaticRoute.js';
import handleError from './handleError.js';
import handleNotFound from './handleNotFound.js';
import handlePreflight from './handlePreflight.js';

export default async function handleRequest(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
): Promise<void> {
	try {
		if (handlePreflight(server, message, response)) {
			return;
		}

		if (await server.handleSecurity?.(server, message, response)) {
			return;
		}

		ApplyCors(server, message, response);

		if (await handleApiRequest(server, message, response)) {
			return;
		}

		if (await handleStaticRoute(server, message, response)) {
			return;
		}

		handleNotFound(server, message, response);
	} catch (ex: unknown) {
		handleError(server, message, response, ex);
	}
}
