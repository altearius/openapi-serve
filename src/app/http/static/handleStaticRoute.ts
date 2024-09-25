import { StatusCodes } from 'http-status-codes';
import { createReadStream } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import ExtractUrl from '../ExtractUrl.js';
import handleError from '../handle/handleError.js';
import handleNotFound from '../handle/handleNotFound.js';
import type OpenApiServer from '../OpenApiServer.js';
import createETag from './createETag.js';
import GetMimeType from './GetMimeType.js';
import matchUrlToStaticRoute from './matchUrlToStaticRoute.js';
import resolveLastModified from './resolveLastModified.js';

export default async function handleStaticRoute(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
) {
	const url = ExtractUrl(message);
	const resolvedPath = matchUrlToStaticRoute(server, url);
	if (!resolvedPath) {
		return false;
	}

	const lastModified = await resolveLastModified(resolvedPath);
	if (lastModified === null) {
		handleNotFound(server, message, response);
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
			handleNotFound(server, message, response);
		} else {
			handleError(server, message, response, ex);
		}
	});

	return true;
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
