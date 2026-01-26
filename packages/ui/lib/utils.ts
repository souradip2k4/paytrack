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