import type { IncomingMessage, ServerResponse } from 'node:http';
import ExtractUrl from './ExtractUrl.js';
import type OpenApiServer from './OpenApiServer.js';
import ReadRequestBody from './ReadRequestBody.js';
import FinalizeResult from './api/FinalizeResult.js';
import IsOpenApiMethod from './api/IsOpenApiMethod.js';
import LoadApiHandler from './api/LoadApiHandler.js';
import ResolveApiRoute from './api/ResolveApiRoute.js';
import Validate from './api/Validate.js';

export default async function HandleApiRequest(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
) {
	const method = message.method?.toLowerCase();
	if (!IsOpenApiMethod(method)) {
		return false;
	}

	const url = ExtractUrl(message);
	const route = ResolveApiRoute(server, method, url);
	if (!route) {
		return false;
	}

	const result = await generateResult(server, message, url, route);
	FinalizeResult(response, result, route.responseTypes);
	return true;
}

type IRoute = NonNullable<Awaited<ReturnType<typeof ResolveApiRoute>>>;

async function generateResult(
	server: OpenApiServer,
	message: IncomingMessage,
	url: URL,
	route: IRoute
) {
	const { pathParameters } = route;
	if (pathParameters) {
		const escapedOperationId = route.operationId.replace(/[^\w]/giu, '_');
		const validationId = `${escapedOperationId}_path_parameters`;
		const validationResult = Validate(server, validationId, pathParameters);
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
		(await handler({ message, pathParameters, requestBody, url }))
	);
}
