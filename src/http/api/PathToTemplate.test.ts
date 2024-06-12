import PathToTemplate from '#openapi-serve/http/api/PathToTemplate.js';
import { describe, expect, it } from '@jest/globals';

describe(PathToTemplate.name, () => {
	it('creates regular expressions to match path templates', () => {
		// Arrange
		const path = '/api/v1/users/{userId}/posts/{post-id}';
		const expected =
			/^\/api\/v1\/users\/(?<id0>[^/]+?)\/posts\/(?<id1>[^/]+?)$/iu;

		// Act
		const { identifiers, pattern } = PathToTemplate(path) ?? {};

		// Assert
		expect(pattern).toEqual(expected);

		expect(identifiers).toEqual(
			new Map([
				['id0', 'userId'],
				['id1', 'post-id']
			])
		);
	});
});
