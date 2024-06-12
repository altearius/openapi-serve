import type { OpenAPIV3_1 } from 'openapi-types';
import type OpenApiServer from '../OpenApiServer.js';
import type IOperationDetails from './IOperationDetails.js';

type IOperationWithPath = IOperationDetails & {
	readonly pathParameters?: Readonly<Record<string, unknown>>;
};

export default function ResolveApiRoute(
	server: OpenApiServer,
	method: OpenAPIV3_1.HttpMethods,
	url: URL
): IOperationWithPath | undefined {
	const pathName = url.pathname.toLowerCase();

	const staticRoute = server.routes.staticRoutes.get(pathName);
	if (staticRoute) {
		return staticRoute.get(method);
	}

	for (const { identifiers, pattern, operations } of server.routes.templates) {
		const { groups: templateValues } = pattern.exec(url.pathname) ?? {};
		const operation = operations.get(method);

		if (!operation || !templateValues) {
			continue;
		}

		const pathParameters = resolvePathParameters(
			templateValues,
			operation,
			identifiers
		);

		return { ...operation, pathParameters };
	}
}

function resolvePathParameters(
	matches: Record<string, string>,
	{ pathParameterTypes: types }: IOperationDetails,
	identifiers: ReadonlyMap<string, string>
) {
	if (!types) {
		throw new Error("Missing 'pathParameterTypes' in operation");
	}

	const result = new Map<string, unknown>();

	for (const [name, rawValue] of Object.entries(matches)) {
		const decodedValue = decodeURIComponent(rawValue);
		const propertyName = identifiers.get(name);
		if (!propertyName) {
			throw new Error(`Unknown path parameter '${name}'`);
		}

		const propertyType = String(types.get(propertyName));
		const propertyValue = coerceType(propertyType, decodedValue);
		result.set(propertyName, propertyValue);
	}

	return Object.fromEntries(result);
}

function coerceType(type: string, value: string) {
	switch (type) {
		case 'number':
			return Number(value);
		case 'integer':
			return parseInt(value, 10);
		case 'string':
			return value;
		case 'boolean':
			return value === 'true';
		default:
			throw new Error(`Unknown type '${type}'`);
	}
}
