import type { OpenAPIV3_1 } from 'openapi-types';

export default interface IOperationDetails {
	readonly operationId: string;
	readonly pathParameterTypes?: ReadonlyMap<
		string,
		NonNullable<OpenAPIV3_1.SchemaObject['type']>
	>;
	readonly responseTypes?: ReadonlyMap<string, ReadonlySet<string>>;
	readonly validationId?: string;
}
