import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	async redirects() {
		return [
			{
				source: "/",
				destination: "/docs",
				permanent: true,
			},
		];
	},
	async rewrites() {
		return [
			{
				source: "/docs/:path*.mdx",
				destination: "/llms.mdx/:path*",
			},
		];
	},
};

const withMDX = createMDX({
	configPath: "source.config.ts",
});

export default withMDX(nextConfig);
