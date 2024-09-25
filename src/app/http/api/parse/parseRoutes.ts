import { dereference } from '@apidevtools/json-schema-ref-parser';
import type { OpenAPIV3_1 } from 'openapi-types';
import getOperationByPath from '../ops/getOperationByPath.js';
import type ApiRoutes from '../routes/ApiRoutes.js';
import templateSort from '../routes/templateSort.js';
import parsePath from './parsePath.js';

export default async function parseRoutes(
	openApiPath: string
): Promise<ApiRoutes> {
	const doc: OpenAPIV3_1.Document = await dereference(openApiPath);
	const staticRoutes = new Map();
	const templates = [];

	for (const [name, pathItem] of Object.entries(doc.paths ?? {})) {
		const operations = getOperationByPath(pathItem);

		if (!operations) {
			continue;
		}

		const template = parsePath(name);

		if (!template) {
			const lcName = name.toLowerCase();
			if (staticRoutes.has(lcName)) {
				throw new Error(`Duplicate static route "${lcName}"`);
			}

			staticRoutes.set(name.toLowerCase(), operations);
			continue;
		}

		templates.push({ ...template, operations });
	}

	return { staticRoutes, templates: templates.sort(templateSort) };
}
