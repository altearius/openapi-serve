import type { Stats } from 'node:fs';
import { stat } from 'node:fs/promises';

export default async function resolveLastModified(resolvedPath: string) {
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
