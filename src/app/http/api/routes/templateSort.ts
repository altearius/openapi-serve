interface HasCount {
	readonly identifiers: { readonly size: number } | undefined;
}

// Templates are sorted by count so we can match the most specific route first.
export default function templateSort(
	{ identifiers: { size: a } = { size: 0 } }: HasCount,
	{ identifiers: { size: b } = { size: 0 } }: HasCount
) {
	if (a < b) {
		return -1;
	}

	if (a > b) {
		return 1;
	}

	return 0;
}
