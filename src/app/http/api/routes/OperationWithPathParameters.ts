import type IOperationDetails from "../IOperationDetails.js";

type OperationWithPathParameters = IOperationDetails & {
	readonly parameters?: {
		readonly path: Readonly<Record<string, unknown>>;
	};
};

export default OperationWithPathParameters;
