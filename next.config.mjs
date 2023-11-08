import { join, dirname } from "path";
import { fileURLToPath } from "url";
import million from "million/compiler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [join(__dirname, "styles")],
  },
  output: "export",
};

const millionConfig = {
  auto: true,
};

export default million.next(nextConfig, millionConfig);
