import type { OpenAPIV3_1 } from 'openapi-types';
import type IOperationDetails from './IOperationDetails.js';

type IParameters = OpenAPIV3_1.PathItemObject['parameters'];
type ISchemaType = NonNullable<OpenAPIV3_1.SchemaObject['type']>;

export default function ExtractOperationDetails(
	pathItem: OpenAPIV3_1.PathItemObject,
	operation: OpenAPIV3_1.OperationObject
): IOperationDetails | undefined {
	const { operationId, responses, requestBody } = operation;
	if (typeof operationId !== 'string') {
		return;
	}

	const pathParameterTypes = extractPathParameterTypes(pathItem, operation);

	const result: IOperationDetails = {
		...(pathParameterTypes ? { pathParameterTypes } : {}),
		...extractContentTypes(responses),
		operationId
	};

	if (requestBody === undefined || !('content' in requestBody)) {
		return result;
	}

	const schema = requestBody.content['application/json']?.schema;

	if (schema === undefined || '$ref' in schema) {
		return result;
	}

	if (!('$id' in schema) || typeof schema.$id !== 'string') {
		throw new Error(`No schema ID for ${operationId}.`);
	}

	return { ...result, validationId: schema.$id };
}

function extractPathParameterTypes(
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

function* collectParameters(parameters: IParameters) {
	if (!validParameters(parameters)) {
		return;
	}

	for (const { name, schema } of parameters) {
		if (schema === undefined || '$ref' in schema) {
			continue;
		}

		yield { name, schema };
	}
}

function validParameters(
	parameters: IParameters
): parameters is OpenAPIV3_1.ParameterObject[] {
	return Array.isArray(parameters) && parameters.every(isParameterObject);
}

function isParameterObject(
	parameter: OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject
): parameter is OpenAPIV3_1.ParameterObject {
	return !('$ref' in parameter);
}

function extractContentTypes(
	responses: OpenAPIV3_1.ResponsesObject | undefined
): {
	readonly responseTypes?: ReadonlyMap<string, ReadonlySet<string>>;
} {
	if (responses === undefined) {
		return {};
	}

	const result = new Map<string, ReadonlySet<string>>();

	for (const [statusCode, response] of Object.entries(responses)) {
		if ('$ref' in response) {
			continue;
		}

		const { content } = response;
		if (content === undefined) {
			continue;
		}

		const keys = Object.keys(content)
			.map((x) => x.toLowerCase().trim())
			.filter(Boolean);

		if (keys.length) {
			result.set(statusCode, new Set(keys));
		}
	}

	return {
		responseTypes: result
	};
}
