import type { OpenAPIV3 } from "openapi-types";
import type IOperationDetails from './IOperationDetails.js';

type MethodMap = ReadonlyMap<OpenAPIV3.HttpMethods, IOperationDetails>;

export default interface ApiRoutes {
	readonly staticRoutes: ReadonlyMap<string, MethodMap>;
	readonly templates: {
		readonly operations: MethodMap;
		readonly identifiers: ReadonlyMap<string, string>;
		readonly pattern: RegExp;
	}[];
}
