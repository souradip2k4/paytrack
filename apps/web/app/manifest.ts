import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Budgetbee",
		short_name: "Budgetbee",
		description:
			"Budgetbee is a simple accounting tool to help you manage your income, expenses, subscriptions, inventory and more.",
		icons: [
			{
				src: "/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		start_url: "/",
		theme_color: "#ffffff",
		background_color: "#ffffff",
		display: "standalone",
	};
}
