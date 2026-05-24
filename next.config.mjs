/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "placeholder.com" },
      { hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
