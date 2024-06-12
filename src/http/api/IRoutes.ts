import type { OpenAPIV3_1 } from 'openapi-types';
import type IOperationDetails from './IOperationDetails.js';

type IOperations = ReadonlyMap<OpenAPIV3_1.HttpMethods, IOperationDetails>;

export default interface IRoutes {
	readonly staticRoutes: ReadonlyMap<string, IOperations>;

	readonly templates: readonly {
		readonly parameters?: readonly OpenAPIV3_1.ParameterObject[];
		readonly identifiers: ReadonlyMap<string, string>;
		readonly pattern: RegExp;
		readonly operations: IOperations;
	}[];
}
