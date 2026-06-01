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
		sitemap: "https://paytrack-web.vercel.app/sitemap.xml",
	};
}
