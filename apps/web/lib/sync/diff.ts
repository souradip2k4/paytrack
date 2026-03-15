/**
 * Compute changed fields between before and after state.
 * Returns only the fields that differ — the JSON Merge Patch (RFC 7396) diff.
 */
export function computePatch(
	before: Record<string, unknown>,
	after: Record<string, unknown>,
): Record<string, unknown> {
	const patch: Record<string, unknown> = {};
	for (const key of Object.keys(after)) {
		const bVal = after[key];
		// Skip NaN values — they would serialize to null and cause false diffs
		if (typeof bVal === "number" && isNaN(bVal)) continue;
		if (JSON.stringify(bVal) !== JSON.stringify(before[key])) {
			patch[key] = bVal;
		}
	}
	return patch;
}
