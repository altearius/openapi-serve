import type { IncomingMessage } from 'http';
import type OpenApiServer from '../../OpenApiServer.js';
import loadOperation from '../ops/loadOperation.js';
import bindParameters from '../parameters/bindParameters.js';
import type ResolvedOperation from '../routes/ResolvedOperation.js';
import readRequestBody from './readRequestBody.js';
import validate from './validate.js';

export default async function generateResult(
	server: OpenApiServer,
	message: IncomingMessage,
	url: URL,
	resolved: ResolvedOperation
) {
	const { operation: op } = resolved;
	const parameters = bindParameters(message, url, resolved);

	const escapedOperationId = op.operationId.replace(/[^\w]/giu, '_');
	const validationId = `${escapedOperationId}_request_parameters`;
	const invalidParameterResult = validate(server, validationId, parameters);

	if (invalidParameterResult) {
		return invalidParameterResult;
	}

	const [handler, body] = await Promise.all([
		loadOperation(server, op.operationId),
		readRequestBody(message)
	]);

	return (
		validate(server, op.validationId, body) ??
		(await handler({ body, message, parameters, url }))
	);
}
