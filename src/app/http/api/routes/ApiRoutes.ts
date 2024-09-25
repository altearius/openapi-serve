import type { OpenAPIV3 } from 'openapi-types';
import type OperationDetails from '../ops/OperationDetails.js';

type MethodMap = ReadonlyMap<OpenAPIV3.HttpMethods, OperationDetails>;

export default interface ApiRoutes {
	readonly staticRoutes: ReadonlyMap<string, MethodMap>;
	readonly templates: {
		readonly operations: MethodMap;
		readonly identifiers: ReadonlyMap<string, string>;
		readonly pattern: RegExp;
	}[];
}
