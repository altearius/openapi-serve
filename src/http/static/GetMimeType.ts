import { extname } from 'node:path';

const mimeTypes = new Map<string, string>([
	['css', 'text/css'],
	['html', 'text/html'],
	['js', 'application/javascript'],
	['map', 'application/json'],
	['png', 'image/png']
]);

export default function GetMimeType(filePath: string): string {
	const extension = extname(filePath).slice(1).toLowerCase(); // remove the dot
	return mimeTypes.get(extension) ?? 'application/octet-stream';
}
