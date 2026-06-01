import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "Paytrack Docs",
			url: "/docs",
		},
		githubUrl: "https://github.com/sammaji/budgetbee",
		links: [
			{
				text: "Visit Website",
				url: "https://paytrack-site-prod.vercel.app",
				external: true,
			},
		],
	};
}
