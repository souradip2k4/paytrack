import bundleAnalyzer from "@next/bundle-analyzer";

const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
	productionBrowserSourceMaps: !isDev,
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		optimizePackageImports: [
			"recharts",
			"lucide-react",
			"date-fns",
			"framer-motion",
			"@polar-sh/sdk",
		],
	},
	transpilePackages: [
		"@budgetbee/core",
		"@budgetbee/ui",
		"@budgetbee/billing",
	],
	serverExternalPackages: ["pg", "pg-pool"],
	images: {
		unoptimized: isDev,
	},
	async redirects() {
		return [
			{
				source: "/",
				destination: "/home",
				permanent: true,
			},
		];
	},
};

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);