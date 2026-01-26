import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN,
});


export const isPro = (price_id: string | undefined | null) => {
	if (!price_id) return false;
	return price_id === process.env.POLAR_PRODUCT_PRO || price_id === process.env.POLAR_PRODUCT_PRO_YEARLY;
}

export const isTeams = (price_id: string | undefined | null) => {
	if (!price_id) return false;
	return price_id === process.env.POLAR_PRODUCT_TEAMS || price_id === process.env.POLAR_PRODUCT_TEAMS_YEARLY;
}

export const isProOrTeams = (price_id: string | undefined | null) => {
	if (!price_id) return false;
	return isPro(price_id) || isTeams(price_id);
}

export const isProOrHigher = (price_id: string | undefined | null) => {
	if (!price_id) return false;
	return isPro(price_id) || isTeams(price_id);
}

export const isTeamsOrHigher = (price_id: string | undefined | null) => {
	if (!price_id) return false;
	return isTeams(price_id);
}