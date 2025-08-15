import { clsx, type ClassValue } from "clsx";
import path from "path";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function wait(ms: number): Promise<void> {
	if (process.env.NODE_ENV === "production")
		return new Promise(resolve => setTimeout(resolve, 0));
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function avatarUrl(src?: string | undefined | null): string {
	const fallbackUrl =
		"https://as2.ftcdn.net/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.webp";
	if (!src) return fallbackUrl;
	if (typeof src === "string" && src.length === 0) return fallbackUrl;
	return src;
}

export function run<T, K = any>(
	x: T | undefined | null,
	cb: (a: T) => K,
): K | undefined {
	if (x === undefined || x === null) return undefined;
	return cb(x);
}

export function runNull<T, K = any>(
	x: T | undefined | null,
	cb: (a: T) => K,
): K | null {
	if (x === undefined || x === null) return null;
	return cb(x);
}

export function castNull<T>(x: T | undefined | null): T | null {
	if (x === undefined) return null;
	return x;
}

export function castUndefined<T>(x: T | undefined | null): T | undefined {
	if (x === null) return undefined;
	return x;
}

export function catchInvalid<T>(x: T | undefined | null, def: T): T {
	if (x === null || x == undefined) return def;
	return x;
}

export function url(route: string = "/") {
	const root = new URL(
		process.env.NODE_ENV === "production" ?
			"https://budgetbee.site"
		:	"http://localhost:3000",
	);
	return new URL(route, root);
}
export function apiUrl(route: string) {
	const root = new URL(
		process.env.NODE_ENV === "production" ?
			"https://budgetbee.site"
		:	"http://localhost:3000",
	);
	return new URL(path.join("api", route), root);
}

export function deep_console_log(obj: any) {
	console.log(JSON.stringify(obj, null, 2));
}
