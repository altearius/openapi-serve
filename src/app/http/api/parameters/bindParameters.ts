import type { IncomingMessage } from 'node:http';
import type ResolvedOperation from '../routes/ResolvedOperation.js';
import bindCookieParameters from './bindCookieParameters.js';
import bindHeaderParameters from './bindHeaderParameters.js';
import bindPathParameters from './bindPathParameters.js';
import bindQueryParameters from './bindQueryParameters.js';
import type { RequestParameters } from './Types.js';

export default function bindParameters(
	message: IncomingMessage,
	url: URL,
	resolved: ResolvedOperation
): RequestParameters {
	const {
		operation: { parameterTypes: types }
	} = resolved;

	return {
		...bindPathParameters(resolved),
		...bindHeaderParameters(message.headersDistinct, types?.header),
		...bindQueryParameters(url.searchParams, types?.query),
		...bindCookieParameters(message.headers.cookie, types?.cookie)
	};
}
