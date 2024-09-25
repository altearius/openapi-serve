import type ResolvedOperation from '../routes/ResolvedOperation.js';
import coerceType from './coerceType.js';

export default function bindPathParameters({
	dynamicRoute: route,
	operation: { parameterTypes: { path: types } = {} }
}: ResolvedOperation) {
	if (!route) {
		return;
	}

	if (!types) {
		throw new Error('Missing path parameter types in dynamic route');
	}

	const result = new Map<string, unknown>();

	for (const [rawName, rawValue] of Object.entries(route.pathValues)) {
		const name = route.pathIdentifiers.get(rawName);
		if (!name) {
			throw new Error(`Unknown path parameter '${rawName}'`);
		}

		const type = types.get(name);
		if (type === undefined) {
			throw new Error(`Unknown path parameter type for '${name}'`);
		}

		const value = decodeURIComponent(rawValue);
		result.set(name, coerceType(type, value));
	}

	return result.size > 0 ? { path: Object.fromEntries(result) } : undefined;
}
