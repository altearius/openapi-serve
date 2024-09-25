import type { OpenAPIV3_1 } from 'openapi-types';
import type OperationDetails from './OperationDetails.js';
import extractContentTypes from './extractContentTypes.js';
import extractPathParameterTypes from './extractPathParameterTypes.js';

export type ISchemaType = NonNullable<OpenAPIV3_1.SchemaObject['type']>;

export default function extractOperationDetails(
	pathItem: OpenAPIV3_1.PathItemObject,
	operation: OpenAPIV3_1.OperationObject
): OperationDetails | undefined {
	const { operationId, responses, requestBody } = operation;
	if (typeof operationId !== 'string') {
		return;
	}

	const pathParameterTypes = extractPathParameterTypes(pathItem, operation);

	const result: OperationDetails = {
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
