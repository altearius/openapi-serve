import type { Ajv, ErrorObject } from 'ajv';
import { Server } from 'node:http';
import type { Socket } from 'node:net';
import { resolve } from 'node:path';
import type { Logger } from 'pino';
import parseRoutes from './api/parse/parseRoutes.js';
import type ApiRoutes from './api/routes/ApiRoutes.js';
import handleRequest from './handle/handleRequest.js';

// Observed on 2024-09-26, some functions generated by AJV do not actually
// include the 'schema' or 'schemaEnv' properties, and therefore cause the
// TypeScript compiler to fail. We aren't actually using those properties
// directly, and omitting them here allows the code to compile. This assumes
// that AJV itself is fine with the missing properties.
//
// This stripped-down interface also changes the return type from a type
// predicate to a simplified boolean. This is because the generated validation
// functions are designed to be imported from a `.cjs` file, which do not yield
// type predicates.
interface ValidationFn {
	(this: Ajv | any, data: unknown): boolean;
	errors?: null | ErrorObject[];
}

interface OpenApiServerConfig {
	readonly allowedOrigins?: readonly RegExp[];
	readonly hostname?: string;
	readonly log?: Logger<string>;
	readonly openApiPath: string;
	readonly operationRootPath: string;
	readonly port?: number;
	readonly staticRoutes?: ReadonlyMap<RegExp, string>;
	readonly validations?: Readonly<Record<string, ValidationFn>>;
}

export default class OpenApiServer extends Server {
	readonly #openSockets: Set<Socket>;

	private constructor(
		public readonly allowedOrigins: readonly RegExp[],
		public readonly log: Logger<string> | undefined,
		public readonly openApiPath: string,
		public readonly operationRootPath: string,
		public readonly routes: ApiRoutes,
		public readonly staticRoutes: ReadonlyMap<RegExp, string>,
		public readonly validations: Readonly<Record<string, ValidationFn>>
	) {
		super((message, response) => {
			response.setHeader('X-Clacks-Overhead', 'GNU Terry Pratchett');
			void handleRequest(this, message, response);
		});

		// Need to capture `connections` in a closure for the following lambda.
		// Accessing it using `this.` later doesn't work and I don't know why.
		const connections = new Set<Socket>();
		this.#openSockets = connections;

		this.on('connection', (connection) => {
			connections.add(connection);
			connection.on('close', () => connections.delete(connection));
		});
	}

	public static async Create(
		config: OpenApiServerConfig
	): Promise<OpenApiServer> {
		const server = new OpenApiServer(
			config.allowedOrigins ?? [/^https?:\/\/localhost:\d+$/iu],
			config.log,
			resolve(config.openApiPath),
			resolve(config.operationRootPath),
			await parseRoutes(config.openApiPath),
			config.staticRoutes ?? new Map(),
			config.validations ?? {}
		);

		return server;
	}

	public override close(
		callback?: ((err?: Error | undefined) => void) | undefined
	) {
		const { size } = this.#openSockets;

		if (size === 0) {
			return super.close(callback);
		}

		this.log?.info(
			'Closing %s open %s',
			size.toLocaleString(),
			size === 1 ? 'connection' : 'connections'
		);

		[...this.#openSockets].forEach((connection) => {
			this.#openSockets.delete(connection);
			connection.destroySoon();
		});

		return super.close(callback);
	}

	public async closeAsync() {
		return new Promise<void>((resolveClose, reject) => {
			this.close((error) => {
				if (error) {
					reject(error);
				} else {
					this.log?.info('Server closed.');
					resolveClose();
				}
			});
		});
	}

	public async listenAsync(port?: number, hostname?: string) {
		return new Promise<void>((resolveListen) => {
			this.listen(port, hostname, undefined, () => {
				this.log?.info(`Server listening on ${hostname}:${port}.`);
				resolveListen();
			});
		});
	}
}
