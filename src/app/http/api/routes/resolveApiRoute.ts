import type { OpenAPIV3_1 } from 'openapi-types';
import type ApiRoutes from './ApiRoutes.js';
import matchDynamicRoute from './matchDynamicRoute.js';
import type ResolvedOperation from './ResolvedOperation.js';

export default function resolveApiRoute(
	routes: ApiRoutes,
	method: OpenAPIV3_1.HttpMethods,
	url: URL
): ResolvedOperation | undefined {
	const staticRoute = routes.staticRoutes.get(url.pathname.toLowerCase());
	if (staticRoute) {
		const operation = staticRoute.get(method);
		return operation ? { operation } : undefined;
	}

	const dynamicRoute = matchDynamicRoute(routes.templates, method, url);

	return dynamicRoute
		? {
				dynamicRoute: {
					pathIdentifiers: dynamicRoute.pathIdentifiers,
					pathValues: dynamicRoute.pathValues
				},
				operation: dynamicRoute.operation
			}
		: undefined;
}
