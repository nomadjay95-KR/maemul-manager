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
            value: [
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.daumcdn.net https://dapi.kakao.com",
              "frame-src 'self' https://postcode.map.daum.net",
              "img-src 'self' data: blob: https://*.daumcdn.net https://map.kakao.com https://*.supabase.co",
            ].join("; ") + ";",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
