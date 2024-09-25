import type { IncomingMessage, ServerResponse } from 'node:http';
import FinalizeResult from '../api/FinalizeResult.js';
import IsOpenApiMethod from '../api/IsOpenApiMethod.js';
import LoadApiHandler from '../api/LoadApiHandler.js';
import headerParameters from '../api/parameters/headerParameters.js';
import type OperationWithPathParameters from '../api/routes/OperationWithPathParameters.js';
import resolveApiRoute from '../api/routes/resolveApiRoute.js';
import Validate from '../api/Validate.js';
import ExtractUrl from '../ExtractUrl.js';
import type OpenApiServer from '../OpenApiServer.js';
import ReadRequestBody from '../ReadRequestBody.js';

export default async function handleApiRequest(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
) {
	const method = message.method?.toLowerCase();
	if (!IsOpenApiMethod(method)) {
		return false;
	}

	const url = ExtractUrl(message);
	const route = resolveApiRoute(server.routes, method, url);
	if (!route) {
		return false;
	}

	const result = await generateResult(server, message, url, route);
	FinalizeResult(response, result, route.responseTypes);
	return true;
}

async function generateResult(
	server: OpenApiServer,
	message: IncomingMessage,
	url: URL,
	route: OperationWithPathParameters
) {
	const parameters = requestParameters(message, route);
	if (parameters) {
		const escapedOperationId = route.operationId.replace(/[^\w]/giu, '_');
		const validationId = `${escapedOperationId}_request_parameters`;
		const validationResult = Validate(server, validationId, parameters);
		if (validationResult) {
			return validationResult;
		}
	}

	const [handler, requestBody] = await Promise.all([
		LoadApiHandler(server, route.operationId),
		ReadRequestBody(message)
	]);

	return (
		Validate(server, route.validationId, requestBody) ??
		(await handler({ message, parameters, requestBody, url }))
	);
}

interface RequestParameters {
	readonly cookie?: Record<string, unknown>;
	readonly header?: Record<string, unknown>;
	readonly path?: Record<string, unknown>;
	readonly query?: Record<string, unknown>;
}

function requestParameters(
	message: IncomingMessage,
	route: OperationWithPathParameters): RequestParameters | undefined {
	const path = route.parameters?.path ?? {};
	const header = headerParameters(message, route);

	if (!path && !header) {
		return;
	}

	return {
		...( path ? { path } : {}),
		...( header ? { header } : {})
	};
}
