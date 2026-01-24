// export const COLORS = {
// 	red: "#C4554D",
// 	orange: "#CC782F",
// 	yellow: "#C29343",
// 	lime: "#548164",
// 	green: "#548164",
// 	emerald: "#4F9768",
// };

export const COLORS = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]

export const CATEGORY_COLORS: Record<string, { name: string, light: { fill: string, text: string }, dark: { fill: string, text: string } }> = {
	"gray": { name: "Gray", light: { fill: "#F1F1EF", text: "#787774" }, dark: { fill: "#252525", text: "#9B9B9B" } },
	"brown": { name: "Brown", light: { fill: "#F3EEEE", text: "#976D57" }, dark: { fill: "#2E2724", text: "#A27763" } },
	"orange": { name: "Orange", light: { fill: "#F8ECDF", text: "#CC782F" }, dark: { fill: "#36291F", text: "#CB7B37" } },
	"yellow": { name: "Yellow", light: { fill: "#FAF3DD", text: "#C29343" }, dark: { fill: "#372E20", text: "#C19138" } },
	"green": { name: "Green", light: { fill: "#EEF3ED", text: "#548164" }, dark: { fill: "#242B26", text: "#4F9768" } },
	"blue": { name: "Blue", light: { fill: "#E9F3F7", text: "#487CA5" }, dark: { fill: "#1F282D", text: "#447ACB" } },
	"purple": { name: "Purple", light: { fill: "#F6F3F8", text: "#8A67AB" }, dark: { fill: "#2A2430", text: "#865DBB" } },
	"pink": { name: "Pink", light: { fill: "#F9F2F5", text: "#B35488" }, dark: { fill: "#2E2328", text: "#BA4A78" } },
	"red": { name: "Red", light: { fill: "#FAECEC", text: "#C4554D" }, dark: { fill: "#332523", text: "#BE524B" } },
}

export function hashStr(s: string, range: number) {
	let hash = 5381;
	for (let i = 0; i < s.length; i++) {
		hash = (hash << 5) + hash + s.charCodeAt(i);
		hash = hash & hash;
	}
	hash = Math.abs(hash);
	return hash % range;
}

export const getColor = (color: string, theme: string) => {
	const c = CATEGORY_COLORS[color]
	if (!c) return null
	if (theme === "dark") return c.dark
	return c.light
}

export const getColorByIdx = (idx: number, theme: string) => {
	if (idx < 0 || idx >= COLORS.length) return null
	const i = COLORS[idx]
	if (!i) return null
	const c = CATEGORY_COLORS[i]
	if (!c) return null
	if (theme === "dark") return c.dark
	return c.light
}

// export function getColor(category: string) {
// 	return CATEGORY_COLORS[hashStr(category.toString(), CATEGORY_COLORS.length)];
// }
