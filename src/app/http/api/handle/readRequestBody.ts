import { StatusCodes } from 'http-status-codes';
import type { IncomingMessage } from 'node:http';
import HttpError from '../../HttpError.js';

export default async function readRequestBody(message: IncomingMessage) {
	const sizeLimit = 1000000;
	let body = '';

	message.setEncoding('utf8');
	for await (const chunk of message) {
		body += String(chunk);

		if (body.length > sizeLimit) {
			throw new HttpError(StatusCodes.REQUEST_TOO_LONG, 'Payload too large');
		}
	}

	const contentType = message.headers['content-type']?.toLowerCase();
	if (!body || contentType !== 'application/json') {
		return body;
	}

	try {
		return JSON.parse(body) as unknown;
	} catch (ex: unknown) {
		if (ex instanceof SyntaxError) {
			throw new HttpError(StatusCodes.BAD_REQUEST, 'Invalid payload');
		}

		throw ex;
	}
}
