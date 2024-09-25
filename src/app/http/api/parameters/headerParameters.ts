import { IncomingMessage } from 'node:http';
import type IOperationDetails from '../IOperationDetails.js';
import coerceType from './coerceType.js';

export default function headerParameters(
	message: IncomingMessage,
	{ parameterTypes: { header: types } = {} }: IOperationDetails
) {
	if (!types) {
		return;
	}

	const result = new Map<string, unknown>();

	for (const [name, type] of types) {
		const raw = normalizeHeaderValue(message.headers[name.toLowerCase()]);
		if (typeof raw !== 'string') {
			continue;
		}

		const typed = coerceType(type, raw);
		result.set(name, typed);
	}

	return Object.fromEntries(result);
}

function normalizeHeaderValue(
	raw: string | string[] | undefined
): string | undefined {
	if (raw === undefined) {
		return;
	}

	if (Array.isArray(raw)) {
		if (raw.length > 1) {
			throw new Error(`Multi-valued header not supported`);
		}

		const [first] = raw;
		if (typeof first === 'string') {
			return first;
		}

		if (first === undefined) {
			return;
		}

		throw new Error(`Invalid header value: ${first}`);
	}

	return raw;
}
