import { StatusCodes } from 'http-status-codes';
import HttpError from '../HttpError.js';
import type OpenApiServer from '../OpenApiServer.js';

export default function Validate(
	server: OpenApiServer,
	validationId: string | undefined,
	object: unknown
) {
	if (typeof validationId !== 'string') {
		return;
	}

	const validation = server.validations[validationId];
	if (!validation || validation(object)) {
		return;
	}

	if ('errors' in validation) {
		const headers = new Map<string, string>();
		headers.set('Content-Type', 'application/json');
		headers.set('Cache-Control', 'no-cache');

		return {
			body: validation.errors,
			headers,
			statusCode: StatusCodes.BAD_REQUEST
		};
	}

	throw new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'Validation failure');
}
