import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
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
