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
	webpack: (config) => {
		config.externals.push("pino-pretty");
		return config;
	},
	reactStrictMode: true,
	output: "export",
	experimental: {
		turbo: {},
	},
};

export default nextConfig;
