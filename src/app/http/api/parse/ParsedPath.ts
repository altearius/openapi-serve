export default interface ParsedPath {
	readonly identifiers: ReadonlyMap<string, string>;
	readonly pattern: RegExp;
}
