import type { StatusCodes } from 'http-status-codes';

export default class HttpError extends Error {
	public constructor(
		public readonly statusCode: StatusCodes,
		message: string
	) {
		super(message);
	}
}
