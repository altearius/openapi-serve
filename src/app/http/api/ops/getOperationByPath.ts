import { type OpenAPIV3_1, OpenAPIV3 } from 'openapi-types';
import extractOperationDetails from './extractOperationDetails.js';
import type OperationDetails from './OperationDetails.js';

export default function getOperationByPath(
	pathItem?: OpenAPIV3_1.PathItemObject
): ReadonlyMap<OpenAPIV3_1.HttpMethods, OperationDetails> | undefined {
	if (!pathItem) {
		return;
	}

	const map = new Map();

	for (const method of Object.values(OpenAPIV3.HttpMethods)) {
		const operation = pathItem[method];
		if (!operation) {
			continue;
		}

		const details = extractOperationDetails(pathItem, operation);

		if (details) {
			map.set(method, details);
		}
	}

	return map.size ? map : undefined;
}
