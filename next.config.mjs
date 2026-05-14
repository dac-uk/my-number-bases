/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
// repo name — drives basePath on GitHub Pages project sites
const repo = "my-number-bases";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
};

export default nextConfig;
