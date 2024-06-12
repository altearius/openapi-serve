import type { IncomingMessage } from 'node:http';

export default function ExtractUrl(message: IncomingMessage): URL {
	return new URL(
		message.url ?? '/',
		`http://${message.headers.host ?? 'localhost'}`
	);
}
