import { StatusCodes } from 'http-status-codes';
import type { IncomingMessage, ServerResponse } from 'node:http';
import HttpError from '../HttpError.js';
import type OpenApiServer from '../OpenApiServer.js';

export default function handlePreflight(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
) {
	if (message.method?.toLowerCase() !== 'options') {
		return false;
	}

	const {
		'access-control-request-headers': requestedHeaders,
		'access-control-request-method': method,
		origin
	} = message.headers;

	if (!origin) {
		server.log?.warn('No origin');
		throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden');
	}

	if (!server.allowedOrigins.some((allowed) => allowed.test(origin))) {
		server.log?.warn(`Forbidden origin: ${origin}`);
		throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden');
	}

	response.setHeader('Access-Control-Allow-Origin', origin);

	response.setHeader(
		'Access-Control-Allow-Headers',
		requestedHeaders ?? 'Content-Type'
	);

	response.setHeader(
		'Access-Control-Allow-Methods',
		method ?? 'DELETE, GET, PATCH, POST, OPTIONS'
	);

	response.statusCode = StatusCodes.NO_CONTENT;
	response.end();
	return true;
}
