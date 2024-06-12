import { dereference } from '@apidevtools/json-schema-ref-parser';
import type { OpenAPIV3_1 } from 'openapi-types';
import { OpenAPIV3 } from 'openapi-types';
import ExtractOperationDetails from './ExtractOperationDetails.js';
import type IOperationDetails from './IOperationDetails.js';
import PathToTemplate from './PathToTemplate.js';

type MethodMap = ReadonlyMap<OpenAPIV3.HttpMethods, IOperationDetails>;

export default async function LoadApiRoutes(openApiPath: string): Promise<{
	readonly staticRoutes: ReadonlyMap<string, MethodMap>;
	readonly templates: {
		readonly operations: MethodMap;
		readonly identifiers: ReadonlyMap<string, string>;
		readonly pattern: RegExp;
	}[];
}> {
	const doc = (await dereference(openApiPath)) as OpenAPIV3_1.Document;
	const staticRoutes = new Map();
	const templates = [];

	for (const [name, pathItem] of Object.entries(doc.paths ?? {})) {
		const operations = resolveOperationDetails(pathItem);

		if (!operations) {
			continue;
		}

		const template = PathToTemplate(name);

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

	return { staticRoutes, templates: templates.sort(sortByCount) };
}

interface IHasCount {
	readonly identifiers: { readonly size: number } | undefined;
}

// Templates are sorted by count so we can match the most specific route first.
function sortByCount(
	{ identifiers: { size: a } = { size: 0 } }: IHasCount,
	{ identifiers: { size: b } = { size: 0 } }: IHasCount
) {
	if (a < b) {
		return -1;
	}

	if (a > b) {
		return 1;
	}

	return 0;
}

function resolveOperationDetails(
	pathItem?: OpenAPIV3_1.PathItemObject
): ReadonlyMap<OpenAPIV3_1.HttpMethods, IOperationDetails> | undefined {
	if (!pathItem) {
		return;
	}

	const map = new Map();

	for (const method of Object.values(OpenAPIV3.HttpMethods)) {
		const operation = pathItem[method];
		if (!operation) {
			continue;
		}

		const details = ExtractOperationDetails(pathItem, operation);

		if (details) {
			map.set(method, details);
		}
	}

	return map.size ? map : undefined;
}
