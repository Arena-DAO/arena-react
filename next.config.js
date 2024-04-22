/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		unoptimized: true,
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
