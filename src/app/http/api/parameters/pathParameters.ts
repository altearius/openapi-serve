import type IOperationDetails from "../IOperationDetails.js";
import coerceType from "./coerceType.js";

export default function pathParameters(
	pathTemplateMatches: Record<string, string>,
	{ parameterTypes: { path: types } = {} }: IOperationDetails,
	identifiers: ReadonlyMap<string, string>
) {
	if (!types) {
		throw new Error("Missing 'parameterTypes' in operation");
	}

	const result = new Map<string, unknown>();

	for (const [name, rawValue] of Object.entries(pathTemplateMatches)) {
		const decodedValue = decodeURIComponent(rawValue);
		const propertyName = identifiers.get(name);
		if (!propertyName) {
			throw new Error(`Unknown path parameter '${name}'`);
		}

		const propertyType = types.get(propertyName);
		if (propertyType === undefined) {
			throw new Error(`Unknown path parameter type for '${propertyName}'`);
		}

		const propertyValue = coerceType(propertyType, decodedValue);
		result.set(propertyName, propertyValue);
	}

	return Object.fromEntries(result);
}
