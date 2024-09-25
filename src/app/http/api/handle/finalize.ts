import { StatusCodes } from 'http-status-codes';
import type { ServerResponse } from 'node:http';
import HttpError from '../../HttpError.js';
import type IApiHandler from '../IApiHandler.js';
import type OperationDetails from '../ops/OperationDetails.js';
import isResult from './isResult.js';
import resolveContentType from './resolveContentType.js';

export default function finalize(
	response: ServerResponse,
	result: Awaited<ReturnType<IApiHandler>>,
	validContentTypes: OperationDetails['responseTypes']
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
