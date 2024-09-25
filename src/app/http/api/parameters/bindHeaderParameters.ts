import { IncomingMessage } from 'node:http';
import type OperationDetails from '../ops/OperationDetails.js';
import bindMultiValueDataSource from './bindMultiValueDataSource.js';

export default function bindHeaderParameters(
	headers: IncomingMessage['headersDistinct'],
	types: NonNullable<OperationDetails['parameterTypes']>['header']
) {
	if (!types) {
		return;
	}

	const accessor = getHeader.bind(null, headers);
	const result = bindMultiValueDataSource(types, accessor);
	return result.size === 0 ? {} : { header: Object.fromEntries(result) };
}

// From the specification:
//   If in is "header" and the name field is "Accept", "Content-Type" or
//   "Authorization", the parameter definition SHALL be ignored.
const ignored: ReadonlySet<string> = new Set([
	'accept',
	'content-type',
	'authorization'
]);

function getHeader(headers: IncomingMessage['headersDistinct'], name: string) {
	const lc = name.toLowerCase();
	return ignored.has(lc) ? undefined : headers[lc];
}
