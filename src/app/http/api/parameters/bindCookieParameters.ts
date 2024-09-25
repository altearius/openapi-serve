import type OperationDetails from '../ops/OperationDetails.js';
import bindMultiValueDataSource from './bindMultiValueDataSource.js';

export default function bindCookieParameters(
	cookieHeader: string | undefined,
	types: NonNullable<OperationDetails['parameterTypes']>['cookie']
) {
	if (!types) {
		return;
	}

	const cookies = parseCookies(cookieHeader);
	const result = bindMultiValueDataSource(types, (name) => cookies.get(name));
	return result.size === 0 ? {} : { cookie: Object.fromEntries(result) };
}

function parseCookies(
	cookieHeader: string | undefined
): ReadonlyMap<string, readonly string[]> {
	const result = new Map<string, string[]>();
	if (!cookieHeader) {
		return result;
	}

	cookieHeader.split(';').forEach((cookie) => {
		const [rawName, ...rawValue] = cookie.split('=');
		const name = decodeURIComponent(rawName?.trim() ?? '');
		if (name.length === 0) {
			return;
		}

		const value = decodeURIComponent(rawValue.join('=').trim());
		const existing = result.get(name);

		if (existing) {
			existing.push(value);
		} else {
			result.set(name, [value]);
		}
	});

	return result;
}
