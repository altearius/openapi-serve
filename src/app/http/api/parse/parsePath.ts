import type ParsedPath from './ParsedPath.js';

export default function parsePath(path: string): ParsedPath | undefined {
	const templateMatch = /\{(?<name>[^}]*?)\}/gu;
	const reEscape = /[\\^$*+?.()|[\]{}]/gu;
	const segments = [];
	const identifiers = new Map<string, string>();
	const names = new Set<string>();
	let cursor = 0;

	for (const match of path.matchAll(templateMatch)) {
		const { index, groups: { name } = {} } = match;

		if (typeof index !== 'number' || typeof name !== 'string') {
			continue;
		}

		if (names.has(name)) {
			throw new Error(`Duplicate parameter name "${name}" in "${path}"`);
		}

		const identifier = `id${identifiers.size}`;
		names.add(name);
		identifiers.set(identifier, name);
		segments.push(path.slice(cursor, index).replace(reEscape, '\\$&'));
		cursor = index + match[0].length;
		segments.push(`(?<${identifier}>[^/]+?)`);
	}

	if (identifiers.size === 0) {
		return;
	}

	segments.push(path.slice(cursor).replace(reEscape, '\\$&'));

	return {
		identifiers,
		pattern: new RegExp(`^${segments.join('')}$`, 'ui')
	};
}
