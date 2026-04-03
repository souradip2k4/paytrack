import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getInitials(name: string | null | undefined) {
	if (!name) return "";
	let [fn, ln] = name?.split(" ") ?? [];
	return `${fn?.at(0)?.toUpperCase() || ""}${ln?.at(0)?.toUpperCase() || ""}`;
}

export function trimLeadingAndTailingSlashes(url: string): string {
	return url.replace(/^\/+|\/+$/g, "");
}

export function trimTailingSlashes(url: string): string {
	return url.replace(/\/+$/g, "");
}

type URLQueryParams = Record<
	string,
	string | number | boolean | undefined | null
>;

/**
 * Constructs a URL by appending path slugs and query (ignores falsy params except 0/false).
 *
 * @example
 * getUrl('https://api.com', 'users', user_id); // https://api.com/users/user_id
 * getUrl('https://api.com', 'v1', 'users', { id: 123, active: null }); // https://api.com/v1/users?id=123&active=false
 */
export function getUrl(
	baseUrl: string,
	...args: [...slugs: string[], params: URLQueryParams] | string[]
) {
	const url = new URL(baseUrl);
	let lastValue = args[args.length - 1];
	if (typeof lastValue === "object") {
		Object.keys(lastValue).forEach(x => {
			const y = lastValue[x];
			if (!y) return;
			url.searchParams.append(x, y.toString());
		});
		args.pop();
	}
	args.forEach(slug => {
		url.pathname += `/${encodeURIComponent(slug as string)}`;
	});
	return trimTailingSlashes(url.toString());
}

/**
 * Returns the URL for the web app (@apps/web).
 */
export function getAppUrl(
	...args: [...slugs: string[], params: URLQueryParams] | string[]
) {
	let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
	if (!baseUrl) {
		baseUrl = "https://app.budget-bee.app";
		console.warn("NEXT_PUBLIC_APP_URL is not set");
	}
	return getUrl(baseUrl, ...args);
}

/**
 * Returns the URL for the landing pages (@apps/site).
 */
export function getSiteUrl(
	...args: [...slugs: string[], params: URLQueryParams] | string[]
) {
	let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
	if (!baseUrl) {
		baseUrl = "https://www.budget-bee.app";
		console.warn("NEXT_PUBLIC_APP_URL is not set");
	}
	return getUrl(baseUrl, ...args);
}
