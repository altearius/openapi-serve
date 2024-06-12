import { StatusCodes } from 'http-status-codes';
import type { ServerResponse } from 'node:http';
import HttpError from '../HttpError.js';
import type IApiHandler from './IApiHandler.js';
import type IOperationDetails from './IOperationDetails.js';

export default function FinalizeResult(
	response: ServerResponse,
	result: Awaited<ReturnType<IApiHandler>>,
	validContentTypes: IOperationDetails['responseTypes']
) {
	if (!isResult(result)) {
		throw new HttpError(
			StatusCodes.INTERNAL_SERVER_ERROR,
			'Invalid handler result'
		);
	}

	response.statusCode = result.statusCode;
	result.headers?.forEach((value, key) => response.setHeader(key, value));

	const contentType = resolveContentType(response, validContentTypes);
	let body: Uint8Array | string;

	if (contentType === 'application/json') {
		body = JSON.stringify(result.body);
	} else if (contentType.startsWith('image/')) {
		if (!(result.body instanceof Uint8Array)) {
			throw new HttpError(
				StatusCodes.INTERNAL_SERVER_ERROR,
				'Invalid image body'
			);
		}

		({ body } = result);
	} else {
		body = String(result.body);
	}

	response.end(body);
}

function isResult(o: unknown): o is Awaited<ReturnType<IApiHandler>> {
	if (typeof o !== 'object' || o === null) {
		return false;
	}

	if (!('statusCode' in o) || typeof o.statusCode !== 'number') {
		return false;
	}

	return true;
}

function resolveContentType(
	response: ServerResponse,
	allResponseTypes: IOperationDetails['responseTypes']
) {
	const defaultContentType = 'application/json';
	const responseTypes = allResponseTypes?.get(response.statusCode.toString());

	const fullContentType = response.getHeader('content-type');
	if (fullContentType !== undefined && typeof fullContentType !== 'string') {
		throw new HttpError(
			StatusCodes.INTERNAL_SERVER_ERROR,
			'Content type must be a string'
		);
	}

	// Trim any parameters from the content type.
	const contentType = fullContentType?.split(';')[0]?.trim();

	// Content-type not specified in OpenAPI.
	if (responseTypes === undefined || responseTypes.size === 0) {
		// Content type not specified in response. Use default.
		if (contentType === undefined) {
			response.setHeader('Content-Type', defaultContentType);
			return defaultContentType;
		}

		// Use content type specified in response.
		return contentType.toLowerCase();
	}

	// Content type not specified by response.
	if (contentType === undefined) {
		// Multiple content types specified in OpenAPI.
		if (responseTypes.size > 1) {
			throw new HttpError(
				StatusCodes.INTERNAL_SERVER_ERROR,
				'Multiple content types; pick one of ' + [...responseTypes].join(', ')
			);
		}

		// Use content type specified in OpenAPI, or default.
		const result = [...responseTypes][0] ?? defaultContentType;
		response.setHeader('Content-Type', result);
		return result.toLowerCase();
	}

	// Content type specified by response and matches declared spec.
	if (responseTypes.has(contentType.toLowerCase())) {
		return contentType.toLowerCase();
	}

	// Content type specified by response and does not match declared spec.
	throw new HttpError(
		StatusCodes.INTERNAL_SERVER_ERROR,
		'Content type must be one of ' + [...responseTypes].join(', ')
	);
}
