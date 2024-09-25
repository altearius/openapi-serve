import type OperationDetails from '../ops/OperationDetails.js';
import type ParsedPath from '../parse/ParsedPath.js';
import type { Result as DynamicRouteResult } from './matchDynamicRoute.js';

export default interface ResolvedOperation {
	readonly operation: OperationDetails;
	readonly dynamicRoute?: {
		readonly pathIdentifiers: ParsedPath['identifiers'];
		readonly pathValues: DynamicRouteResult['pathValues'];
	};
}
