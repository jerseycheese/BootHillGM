/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  webpack: (config, { isServer: _isServer }) => {
    // Fast Refresh is enabled by default in development mode
    return config;
  },
};

export default nextConfig;
