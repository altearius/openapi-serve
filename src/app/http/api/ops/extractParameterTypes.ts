import type { OpenAPIV3_1 } from 'openapi-types';
import type { ParameterType } from '../parameters/Types.js';
import type OperationDetails from './OperationDetails.js';

type LocationName = keyof NonNullable<OperationDetails['parameterTypes']>;

export default function extractParameterTypes(
	pathItem: OpenAPIV3_1.PathItemObject,
	operationItem: OpenAPIV3_1.OperationObject
): OperationDetails['parameterTypes'] {
	const locations = new Map<LocationName, Map<string, ParameterType>>();

	for (const { locationName, name, type } of valid(pathItem, operationItem)) {
		const existing = locations.get(locationName);

		if (existing) {
			existing.set(name, type);
		} else {
			locations.set(
				locationName,
				new Map<string, ParameterType>([[name, type]])
			);
		}
	}

	return locations.size === 0 ? undefined : Object.fromEntries(locations);
}

function isLocationName(name: string): name is LocationName {
	return ['query', 'header', 'path', 'cookie'].includes(name);
}

function* valid(
	{ parameters: pathParameters = [] }: OpenAPIV3_1.PathItemObject,
	{ parameters: operationParameters = [] }: OpenAPIV3_1.OperationObject
) {
	for (const parameters of [pathParameters, operationParameters]) {
		for (const parameter of parameters) {
			if ('$ref' in parameter) {
				throw new Error('Dereference parameters before extracting types.');
			}

			const { in: locationName, name, schema } = parameter;
			if (!schema) {
				continue;
			}

			if ('$ref' in schema) {
				throw new Error('Dereference schemas before extracting types.');
			}

			const { type } = schema;
			if (!type) {
				continue;
			}

			if (!isLocationName(locationName)) {
				continue;
			}

			yield { locationName, name, type };
		}
	}
}
