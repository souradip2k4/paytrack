import twColors from "tailwindcss/colors";

export function hashStr(s: string, range: number) {
	let hash = 5381;
	for (let i = 0; i < s.length; i++) {
		hash = (hash << 5) + hash + s.charCodeAt(i);
		hash = hash & hash;
	}
	hash = Math.abs(hash);
	return hash % range;
}

export function getColor(category: string) {
	const colors = [
		"red",
		"orange",
		"amber",
		"yellow",
		"lime",
		"green",
		"emerald",
		"teal",
		"cyan",
		"sky",
		"indigo",
		"violet",
		"purple",
		"fuchsia",
		"pink",
	];
	// @ts-ignore
	return twColors[colors[hashStr(category.toString(), colors.length)]][600];
}
