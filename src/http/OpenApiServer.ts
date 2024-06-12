import type { DataValidationCxt } from 'ajv/dist/types/index.js';
import { Server } from 'node:http';
import type { Socket } from 'node:net';
import { resolve } from 'node:path';
import type { Logger } from 'pino';
import Route from './Route.js';
import LoadApiRoutes from './api/LoadApiRoutes.js';

type ValidateFunction = (
	this: unknown,
	data: unknown,
	dataCxt?: DataValidationCxt
) => boolean;

interface OpenApiServerConfig {
	readonly allowedOrigins?: readonly RegExp[];
	readonly hostname?: string;
	readonly log?: Logger<string>;
	readonly openApiPath: string;
	readonly operationRootPath: string;
	readonly port?: number;
	readonly staticRoutes?: ReadonlyMap<RegExp, string>;
	readonly validations?: Readonly<Record<string, ValidateFunction>>;
}

export default class OpenApiServer extends Server {
	readonly #openSockets: Set<Socket>;

	private constructor(
		public readonly allowedOrigins: readonly RegExp[],
		public readonly log: Logger<string> | undefined,
		public readonly openApiPath: string,
		public readonly operationRootPath: string,
		public readonly routes: Awaited<ReturnType<typeof LoadApiRoutes>>,
		public readonly staticRoutes: ReadonlyMap<RegExp, string>,
		public readonly validations: Readonly<Record<string, ValidateFunction>>
	) {
		super((message, response) => {
			response.setHeader('X-Clacks-Overhead', 'GNU Terry Pratchett');
			void Route(this, message, response);
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
			await LoadApiRoutes(config.openApiPath),
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
