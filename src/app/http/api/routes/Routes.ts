import type { OpenAPIV3_1 } from 'openapi-types';
import type IOperationDetails from '../IOperationDetails.js';

type Operations = ReadonlyMap<OpenAPIV3_1.HttpMethods, IOperationDetails>;

export default interface Routes {
	readonly staticRoutes: ReadonlyMap<string, Operations>;

	readonly templates: readonly {
		readonly parameters?: readonly OpenAPIV3_1.ParameterObject[];
		readonly identifiers: ReadonlyMap<string, string>;
		readonly pattern: RegExp;
		readonly operations: Operations;
	}[];
}
