/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ganatecnica.s3.us-east-1.amazonaws.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Set your desired size limit here, e.g. '5mb', '10mb', or a number in bytes like 5000000
    },
  },
};

export default nextConfig;
