import type { IncomingMessage, ServerResponse } from 'node:http';
import ApplyCors from './ApplyCors.js';
import HandleApiRequest from './HandleApiRequest.js';
import HandleError from './HandleError.js';
import HandleNotFound from './HandleNotFound.js';
import HandlePreflight from './HandlePreflight.js';
import type OpenApiServer from './OpenApiServer.js';
import StaticRouteHandler from './static/StaticRouteHandler.js';

export default async function Route(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
): Promise<void> {
	try {
		if (HandlePreflight(server, message, response)) {
			return;
		}

		ApplyCors(server, message, response);

		if (await HandleApiRequest(server, message, response)) {
			return;
		}

		if (await StaticRouteHandler(server, message, response)) {
			return;
		}

		HandleNotFound(server, message, response);
	} catch (ex: unknown) {
		HandleError(server, message, response, ex);
	}
}
