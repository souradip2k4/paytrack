export default function robots() {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
			},
			{
				userAgent: "AdsBot-Google",
				allow: "/",
			},
		],
		sitemap: "https://www.budgetbee.site/sitemap.xml",
	};
}
