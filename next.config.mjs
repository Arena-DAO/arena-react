import { dirname, join } from "path";
import { fileURLToPath } from "url";
import million from "million/compiler";
import withOptimizedImages from "next-optimized-images";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = withOptimizedImages(
	{
		images: {
			unoptimized: true,
		},
		reactStrictMode: true,
		swcMinify: true,
		sassOptions: {
			includePaths: [join(__dirname, "./src/styles")],
		},
		output: "export",
	},
	{ optimizeImagesInDev: true },
);

const millionConfig = {
	auto: true,
};

export default million.next(nextConfig, millionConfig);
