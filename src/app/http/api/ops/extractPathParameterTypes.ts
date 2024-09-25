import type { OpenAPIV3_1 } from 'openapi-types';
import collectParameters from './collectParameters.js';
import type { ISchemaType } from './extractOperationDetails.js';

export default function extractPathParameterTypes(
	{ parameters: pathParameters = [] }: OpenAPIV3_1.PathItemObject,
	{ parameters: operationParameters = [] }: OpenAPIV3_1.OperationObject
): ReadonlyMap<string, ISchemaType> | undefined {
	const parameters = [
		...collectParameters(pathParameters),
		...collectParameters(operationParameters)
	].reduce(
		(map, { name, schema: { type } }) => (type ? map.set(name, type) : map),
		new Map<string, ISchemaType>()
	);

	return parameters.size === 0 ? undefined : parameters;
}
