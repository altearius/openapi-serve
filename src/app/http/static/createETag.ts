import crypto from 'node:crypto';

export default function createETag(resolvedPath: string, lastModified: string) {
	return crypto
		.createHash('md5')
		.update(`${resolvedPath}-${lastModified}`)
		.digest('hex');
}
