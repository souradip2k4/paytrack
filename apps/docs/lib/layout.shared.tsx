import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "Budgetbee Docs",
			url: "/docs",
		},
		githubUrl: "https://github.com/sammaji/budgetbee",
		links: [
			{
				text: "Visit Website",
				url: "https://www.budget-bee.app",
				external: true,
			},
		],
	};
}
