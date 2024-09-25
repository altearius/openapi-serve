import { StatusCodes } from 'http-status-codes';
import { resolve } from 'node:path';
import HttpError from '../../HttpError.js';
import type OpenApiServer from '../../OpenApiServer.js';
import type IApiHandler from '../IApiHandler.js';

export default async function loadOperation(
	server: OpenApiServer,
	operationId: string
) {
	const module = await loadModule(server, operationId);

	if (typeof module !== 'object') {
		server.log?.error({ operationId }, 'Operation is not an object.');
		throw new HttpError(StatusCodes.NOT_FOUND, 'Operation not found.');
	}

	if (module === null) {
		server.log?.error({ operationId }, 'Operation is null.');
		throw new HttpError(StatusCodes.NOT_FOUND, 'Operation not found.');
	}

	if (!('default' in module)) {
		server.log?.error({ operationId }, 'Operation has no default export.');
		throw new HttpError(StatusCodes.NOT_FOUND, 'Operation not found.');
	}

	const { default: operation } = module;

	if (typeof operation !== 'function') {
		server.log?.error(
			{ operation, operationId },
			'Operation default export is not a function.'
		);

		throw new HttpError(StatusCodes.NOT_FOUND, 'Operation not found.');
	}

	if (operation.length > 1) {
		server.log?.error(
			{ operationId },
			'Operation default export must have 1 or fewer parameters.'
		);

		throw new HttpError(StatusCodes.NOT_FOUND, 'Operation not found.');
	}

	return operation as IApiHandler;
}

async function loadModule(server: OpenApiServer, operationId: string) {
	const operationPath = resolve(server.operationRootPath, `${operationId}.js`);

	try {
		return (await import(operationPath)) as unknown;
	} catch (ex: unknown) {
		if (
			ex instanceof Error &&
			'code' in ex &&
			ex.code === 'ERR_MODULE_NOT_FOUND'
		) {
			server.log?.error({ operationId, operationPath }, ex.message);
			throw new HttpError(StatusCodes.NOT_FOUND, 'Operation not found.');
		}

		server.log?.error({ operationId }, 'Failed to load operation.');
		throw ex;
	}
}
