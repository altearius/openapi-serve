import type IApiHandler from '../IApiHandler.js';

export default function isResult(
	o: unknown
): o is Awaited<ReturnType<IApiHandler>> {
	if (typeof o !== 'object' || o === null) {
		return false;
	}

	if (!('statusCode' in o) || typeof o.statusCode !== 'number') {
		return false;
	}

	return true;
}
