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
	swcMinify: true,
	output: "export",
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		missingSuspenseWithCSRBailout: false,
	},
};

export default nextConfig;
