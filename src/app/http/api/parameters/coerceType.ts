import type { OpenAPIV3_1 } from 'openapi-types';

export default function coerceType(
	type: NonNullable<OpenAPIV3_1.SchemaObject['type']>,
	value: string
) {
	switch (type) {
		case 'number':
			return Number(value);
		case 'integer':
			return parseInt(value, 10);
		case 'string':
			return value;
		case 'boolean':
			return value === 'true';
		default:
			throw new Error(`Unknown type '${type}'`);
	}
}
