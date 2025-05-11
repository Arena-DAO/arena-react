/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "jackal.link",
				pathname:
					"/p/jkl10u46uacs9atcdlsh92085lkvwaq3yn9v7zm2e8/radiant/Arena%20DAO/**",
			},
		],
	},
	reactStrictMode: true,
	output: "export",
	turbopack: {},
};

export default nextConfig;
