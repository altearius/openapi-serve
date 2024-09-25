import type { OpenAPIV3_1 } from 'openapi-types';

type IParameters = OpenAPIV3_1.PathItemObject['parameters'];

export default function* collectParameters(parameters: IParameters) {
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
