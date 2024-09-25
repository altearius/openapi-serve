import type { StatusCodes } from 'http-status-codes';
import type { IncomingMessage, ServerResponse } from 'node:http';

type ResponseHeaders = ReadonlyMap<
	string,
	Parameters<ServerResponse['setHeader']>[1]
>;

interface Responses {
	[key: string]: unknown;
	readonly responses?: object;
}

type ResponseBody<
	TOperations extends Readonly<Record<TPath, Responses>>,
	TPath extends keyof TOperations,
	TCode extends keyof TOperations[TPath]['responses']
> = TOperations[TPath]['responses'][TCode] extends {
	content: {
		readonly 'application/json': infer TBody;
	};
}
	? TBody
	: TOperations[TPath]['responses'][TCode] extends {
				content: {
					readonly 'image/jpeg': unknown;
				};
		  }
		? Uint8Array
		: unknown;

type Response<
	TOperations extends Readonly<Record<TPath, Responses>>,
	TPath extends keyof TOperations = never
> = [TPath] extends [never]
	? {
			readonly body: unknown;
			readonly headers?: ResponseHeaders;
			readonly statusCode: StatusCodes;
		}
	: {
			[TCode in keyof TOperations[TPath]['responses']]: TOperations[TPath]['responses'][TCode] extends {
				content: never;
			}
				? {
						readonly headers?: ResponseHeaders;
						readonly statusCode: TCode;
					}
				: {
						readonly body: ResponseBody<TOperations, TPath, TCode>;
						readonly headers?: ResponseHeaders;
						readonly statusCode: TCode;
					};
		}[keyof TOperations[TPath]['responses']];

type IApiHandler<
	TOperations extends {
		readonly [TPath in keyof TOperations]: Responses;
	} = never,
	TPath extends keyof TOperations = never
> = (context: {
	readonly body: TOperations[TPath] extends
		| {
				requestBody: {
					content: { 'application/json': infer TRequestBody };
				};
		  }
		| undefined
		? TRequestBody
		: never;
	readonly message: IncomingMessage;

	readonly parameters: TOperations[TPath] extends {
		parameters: {
			cookie?: infer TCookieParameters;
			header?: infer THeaderParameters;
			path?: infer TPathParameters;
			query?: infer TQueryParameters;
		};
	}
		? {
				cookie?: TCookieParameters;
				header?: THeaderParameters;
				path?: TPathParameters;
				query?: TQueryParameters;
			}
		: {};

	readonly url: URL;
}) => Promise<Response<TOperations, TPath>>;

export default IApiHandler;
