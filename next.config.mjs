import million from "million/compiler";

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		unoptimized: true,
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

const millionConfig = {
	auto: true,
};

export default million.next(nextConfig, millionConfig);
