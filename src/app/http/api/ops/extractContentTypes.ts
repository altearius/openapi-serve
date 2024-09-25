import type { OpenAPIV3_1 } from 'openapi-types';

export default function extractContentTypes(
	responses: OpenAPIV3_1.ResponsesObject | undefined
): {
	readonly responseTypes?: ReadonlyMap<string, ReadonlySet<string>>;
} {
	if (responses === undefined) {
		return {};
	}

	const result = new Map<string, ReadonlySet<string>>();

	for (const [statusCode, response] of Object.entries(responses)) {
		if ('$ref' in response) {
			continue;
		}

		const { content } = response;
		if (content === undefined) {
			continue;
		}

		const keys = Object.keys(content)
			.map((x) => x.toLowerCase().trim())
			.filter(Boolean);

		if (keys.length) {
			result.set(statusCode, new Set(keys));
		}
	}

	return {
		responseTypes: result
	};
}
