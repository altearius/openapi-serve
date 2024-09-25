import type { OpenAPIV3_1 } from 'openapi-types';
import type ApiRoutes from '../ApiRoutes.js';
import pathParameters from '../parameters/pathParameters.js';
import matchUrlToApiRoute from './matchUrlToApiRoute.js';
import type OperationWithPathParameters from './OperationWithPathParameters.js';

export default function resolveApiRoute(
	routes: ApiRoutes,
	method: OpenAPIV3_1.HttpMethods,
	url: URL
): OperationWithPathParameters | undefined {
	const pathName = url.pathname.toLowerCase();

	const staticRoute = routes.staticRoutes.get(pathName);
	if (staticRoute) {
		return staticRoute.get(method);
	}

	const dynamicRoute = matchUrlToApiRoute(routes.templates, method, url);
	if (!dynamicRoute) {
		return;
	}

	return {
		...dynamicRoute.operation,
		parameters: {
			path: pathParameters(
				dynamicRoute.templateValues,
				dynamicRoute.operation,
				dynamicRoute.identifiers
			)
		}
	};
}
