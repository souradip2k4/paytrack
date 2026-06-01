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
		sitemap: "https://paytrack-site-prod.vercel.app/sitemap.xml",
	};
}
