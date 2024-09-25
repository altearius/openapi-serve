import type { OpenAPIV3_1 } from 'openapi-types';
import type OperationDetails from '../ops/OperationDetails.js';
import type ParsedPath from '../parse/ParsedPath.js';
import type ApiRoutes from './ApiRoutes.js';

export interface Result {
	readonly operation: OperationDetails;
	readonly pathIdentifiers: ParsedPath['identifiers'];
	readonly pathValues: Readonly<Record<string, string>>;
}

export default function matchDynamicRoute(
	templates: ApiRoutes['templates'],
	method: OpenAPIV3_1.HttpMethods,
	url: URL
): Result | undefined {
	for (const { operations, pattern, identifiers } of templates) {
		const operation = operations.get(method);
		if (!operation) {
			continue;
		}

		const { groups: pathValues } = pattern.exec(url.pathname) ?? {};

		if (!pathValues) {
			continue;
		}

		return { operation, pathIdentifiers: identifiers, pathValues };
	}
}
