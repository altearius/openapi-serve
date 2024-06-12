import { StatusCodes } from 'http-status-codes';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { inspect } from 'node:util';
import HttpError from './HttpError.js';
import type OpenApiServer from './OpenApiServer.js';

export default function HandleError(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse,
	error: unknown
) {
	response.setHeader('Content-Type', 'text/plain');
	response.setHeader('Cache-Control', 'no-cache');

	if (error instanceof HttpError) {
		response.statusCode = error.statusCode;
		response.end(error.message);
		return;
	}

	logError(error, server, message);
	response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
	response.end(`Internal Server Error\n\n${renderError(error)}`);
}

function logError(
	error: unknown,
	server: OpenApiServer,
	{ method, url }: IncomingMessage
) {
	const err = { method, url };

	if (error instanceof Error) {
		server.log?.error(
			{ ...err, message: error.message },
			'Unexpected error\n%s',
			error.stack
		);

		return;
	}

	server.log?.error(
		err,
		'Unexpected error\n%s',
		inspect(error, { colors: true })
	);
}

function renderError(error: unknown) {
	if (error instanceof Error) {
		return `${error.message}\n\n${error.stack ?? '-no stack-'}`;
	}

	return inspect(error, { colors: false });
}
