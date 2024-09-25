import type { ServerResponse } from 'http';
import { StatusCodes } from 'http-status-codes';
import HttpError from '../../HttpError.js';
import type OperationDetails from '../ops/OperationDetails.js';

export default function resolveContentType(
	response: ServerResponse,
	allResponseTypes: OperationDetails['responseTypes']
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
