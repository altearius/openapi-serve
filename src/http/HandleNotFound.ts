import { StatusCodes } from 'http-status-codes';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type OpenApiServer from './OpenApiServer.js';

export default function HandleNotFound(
	server: OpenApiServer,
	message: IncomingMessage,
	response: ServerResponse
) {
	server.log?.error(
		{
			method: message.method,
			url: message.url
		},
		'Not found'
	);

	response.setHeader('Content-Type', 'text/html');
	response.setHeader('Cache-Control', 'no-cache');
	response.statusCode = StatusCodes.NOT_FOUND;

	response.end(`<html>
		<head>
			<title>Not Found</title>
		</head>
		<body>
			<h1>Not Found</h1>
		</body>
	</html>`);
}
