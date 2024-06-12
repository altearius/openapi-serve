import { dirname, resolve, sep } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { absolutePath } from 'swagger-ui-dist';
import type OpenApiServer from '../OpenApiServer.js';

const thisUrl = new URL(import.meta.url);
const thisPath = fileURLToPath(thisUrl);
const serverRootPath = resolve(thisPath, '..', '..', '..', '..');

const includedRoutes: readonly (readonly [RegExp, string])[] = [
	[/^\/favicon.ico$/iu, resolve(serverRootPath, 'assets', 'favicon.ico')],
	[
		/^\/swagger-ui\/swagger-initializer\.js$/iu,
		resolve(serverRootPath, 'assets', 'swagger-initializer.js')
	],
	[/^\/swagger-ui\/(?<relative>.+)$/iu, `${absolutePath()}${sep}{relative}`]
];

const openApiRoute = /^\/open-api\/(?<relative>.+)\.yaml$/iu;

export default function ResolveStaticRoute(
	server: OpenApiServer,
	pathname: string
): string | undefined {
	return (
		matchRouteCollection(pathname, server.staticRoutes) ??
		matchRouteCollection(pathname, includedRoutes) ??
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
