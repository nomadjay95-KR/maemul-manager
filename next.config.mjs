/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "placeholder.com" },
      { hostname: "*.supabase.co" },
    ],
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
