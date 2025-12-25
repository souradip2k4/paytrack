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

export function isTargetEditable(target: HTMLElement) {
	return (
		target.tagName === "INPUT" || // for <input />
		target.tagName === "TEXTAREA" || // for <textarea />
		target.isContentEditable // for elements with contentEditable="true"
	);
}
