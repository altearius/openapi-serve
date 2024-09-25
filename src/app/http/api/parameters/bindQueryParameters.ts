import type OperationDetails from '../ops/OperationDetails.js';
import bindMultiValueDataSource from './bindMultiValueDataSource.js';

export default function bindQueryParameters(
	searchParams: URLSearchParams,
	types: NonNullable<OperationDetails['parameterTypes']>['query']
) {
	if (!types) {
		return;
	}

	const accessor = searchParams.getAll.bind(searchParams);
	const result = bindMultiValueDataSource(types, accessor);

	return result.size === 0 ? {} : { query: Object.fromEntries(result) };
}
