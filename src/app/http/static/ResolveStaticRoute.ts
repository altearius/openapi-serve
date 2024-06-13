import { dirname, resolve, sep } from 'node:path';
import type OpenApiServer from '../OpenApiServer.js';

const openApiRoute = /^\/open-api\/(?<relative>.+)\.yaml$/iu;

export default function ResolveStaticRoute(
	server: OpenApiServer,
	pathname: string
): string | undefined {
	return (
		matchRouteCollection(pathname, server.staticRoutes) ??
		matchRouteCollection(pathname, [
			[openApiRoute, `${dirname(server.openApiPath)}${sep}{relative}.yaml`]
		])
	);
}

function matchRouteCollection(
	pathname: string,
	routes: Iterable<readonly [RegExp, string]>
): string | undefined {
	for (const [regex, filePath] of routes) {
		const match = regex.exec(pathname);

		if (match) {
			const relative = match.groups?.relative;

			return relative
				? resolve(filePath.replace('{relative}', relative))
				: filePath;
		}
	}
}
