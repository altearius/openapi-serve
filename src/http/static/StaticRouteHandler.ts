import { StatusCodes } from 'http-status-codes';
import crypto from 'node:crypto';
import type { Stats } from 'node:fs';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import ExtractUrl from '../ExtractUrl.js';
import HandleError from '../HandleError.js';
import HandleNotFound from '../HandleNotFound.js';
import type OpenApiServer from '../OpenApiServer.js';
import GetMimeType from './GetMimeType.js';
import ResolveStaticRoute from './ResolveStaticRoute.js';

export default async function StaticRouteHandler(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
) {
	const url = ExtractUrl(message);
	const resolvedPath = ResolveStaticRoute(server, url.pathname);
	if (!resolvedPath) {
		return false;
	}

	const lastModified = await resolveLastModified(resolvedPath);
	if (lastModified === null) {
		HandleNotFound(server, message, response);
		return true;
	}

	const eTag = createETag(resolvedPath, lastModified);

	if (handleCacheHit(message, response, eTag, lastModified)) {
		return true;
	}

	const stream = createReadStream(resolvedPath);

	stream.on('open', () => {
		response.setHeader('Content-Type', GetMimeType(resolvedPath));
		response.setHeader('Last-Modified', lastModified);
		response.setHeader('ETag', eTag);
		response.setHeader('Cache-Control', 'public, max-age=86400');
		response.statusCode = 200;
		stream.pipe(response);
	});

	stream.on('error', (ex) => {
		stream.destroy();

		if ('code' in ex && ex.code === 'ENOENT') {
			HandleNotFound(server, message, response);
		} else {
			HandleError(server, message, response, ex);
		}
	});

	return true;
}

async function resolveLastModified(resolvedPath: string) {
	let stats: Stats;

	try {
		stats = await stat(resolvedPath);
	} catch (ex: unknown) {
		if (
			typeof ex === 'object' &&
			ex !== null &&
			'code' in ex &&
			ex.code === 'ENOENT'
		) {
			return null;
		}

		throw ex;
	}

	return stats.mtime.toUTCString();
}

function createETag(resolvedPath: string, lastModified: string) {
	return crypto
		.createHash('md5')
		.update(`${resolvedPath}-${lastModified}`)
		.digest('hex');
}

function handleCacheHit(
	message: IncomingMessage,
	response: ServerResponse,
	eTag: string,
	lastModified: string
) {
	if (
		message.headers['if-none-match'] === eTag ||
		message.headers['if-modified-since'] === lastModified
	) {
		response.statusCode = StatusCodes.NOT_MODIFIED;
		response.end();
		return true;
	}

	return false;
}
