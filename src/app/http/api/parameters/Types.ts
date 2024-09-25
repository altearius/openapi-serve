import type { OpenAPIV3_1 } from 'openapi-types';

export type ParameterType = NonNullable<OpenAPIV3_1.SchemaObject['type']>;
export type ParameterTypes = ReadonlyMap<string, ParameterType>;

export interface RequestParameters {
	readonly cookie?: Record<string, unknown>;
	readonly header?: Record<string, unknown>;
	readonly path?: Record<string, unknown>;
	readonly query?: Record<string, unknown>;
}
