import type { OpenAPIV3_1 } from 'openapi-types';

type ParameterType = NonNullable<OpenAPIV3_1.SchemaObject['type']>;
type ParameterTypes = ReadonlyMap<string, ParameterType>;

export default interface IOperationDetails {
	readonly operationId: string;
	readonly parameterTypes?: {
		readonly cookie?: ParameterTypes;
		readonly header?: ParameterTypes;
		readonly path?: ParameterTypes;
		readonly query?: ParameterTypes;
	};
	readonly responseTypes?: ReadonlyMap<string, ReadonlySet<string>>;
	readonly validationId?: string;
}
