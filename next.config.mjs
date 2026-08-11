/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
