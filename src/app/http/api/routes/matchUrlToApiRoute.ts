import type { OpenAPIV3_1 } from "openapi-types";
import type ApiRoutes from "../ApiRoutes.js";

export default function matchUrlToApiRoute(
	templates: ApiRoutes['templates'],
	method: OpenAPIV3_1.HttpMethods,
	url: URL
) {
	for (const { operations, pattern, identifiers } of templates) {
		const operation = operations.get(method);
		if (!operation) {
			continue;
		}

		const { groups: templateValues } = pattern.exec(url.pathname) ?? {};

		if (!templateValues) {
			continue;
		}

		return { identifiers, operation, templateValues };
	}
}
