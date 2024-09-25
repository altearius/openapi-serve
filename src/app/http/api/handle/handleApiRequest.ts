import type { IncomingMessage, ServerResponse } from 'node:http';
import ExtractUrl from '../../ExtractUrl.js';
import type OpenApiServer from '../../OpenApiServer.js';
import resolveApiRoute from '../routes/resolveApiRoute.js';
import finalize from './finalize.js';
import generateResult from './generateResult.js';
import isOpenApiMethod from './isOpenApiMethod.js';

export default async function handleApiRequest(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
) {
	const method = message.method?.toLowerCase();
	if (!isOpenApiMethod(method)) {
		return false;
	}

	const url = ExtractUrl(message);
	const resolved = resolveApiRoute(server.routes, method, url);
	if (!resolved) {
		return false;
	}

	const result = await generateResult(server, message, url, resolved);
	finalize(response, result, resolved.operation.responseTypes);
	return true;
}
