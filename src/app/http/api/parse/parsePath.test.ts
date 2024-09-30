import parsePath from '#app/http/api/parse/parsePath.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

await describe(parsePath.name, async () => {
	await it('creates regular expressions to match path templates', () => {
		// Arrange
		const path = '/api/v1/users/{userId}/posts/{post-id}';
		const expected =
			/^\/api\/v1\/users\/(?<id0>[^/]+?)\/posts\/(?<id1>[^/]+?)$/iu;

		// Act
		const { identifiers, pattern } = parsePath(path) ?? {};

		// Assert
		assert.strictEqual(pattern?.source, expected.source);

		assert.deepStrictEqual(
			identifiers,
			new Map([
				['id0', 'userId'],
				['id1', 'post-id']
			])
		);
	});
});
