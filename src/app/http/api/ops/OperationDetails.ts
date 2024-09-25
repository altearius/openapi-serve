import type { ParameterTypes } from '../parameters/Types.js';

export default interface OperationDetails {
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
