/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "lemmebuild.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
