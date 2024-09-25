import type { OpenAPIV3_1 } from 'openapi-types';

export default function isOpenApiMethod(
	method: string | undefined
): method is OpenAPIV3_1.HttpMethods {
	return (
		method === 'get' ||
		method === 'put' ||
		method === 'post' ||
		method === 'delete' ||
		method === 'options' ||
		method === 'head' ||
		method === 'patch' ||
		method === 'trace'
	);
}
