import coerceType from './coerceType.js';
import type { ParameterTypes } from './Types.js';

export default function bindMultiValueDataSource(
	types: ParameterTypes,
	accessor: (name: string) => readonly string[] | undefined
) {
	const result = new Map<string, unknown>();

	for (const [name, type] of types) {
		const raw = accessor(name);
		if (raw === undefined) {
			continue;
		}

		if (type === 'array') {
			if (raw.length > 0) {
				result.set(name, raw);
			}

			continue;
		}

		if (raw.length > 1) {
			result.set(name, raw);
			continue;
		}

		const [first] = raw;
		if (typeof first !== 'string') {
			continue;
		}

		result.set(name, coerceType(type, first));
	}

	return result;
}
