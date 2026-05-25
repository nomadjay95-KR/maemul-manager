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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.daumcdn.net https://*.daumcdn.net https://dapi.kakao.com https://*.kakao.com",
              "frame-src 'self' https://postcode.map.daum.net https://*.daumcdn.net https://*.kakao.com",
              "frame-ancestors 'self' https://*.kakao.com https://*.daumcdn.net",
              "img-src 'self' data: blob: https://*.daumcdn.net https://map.kakao.com https://*.kakao.com https://*.supabase.co",
              "connect-src 'self' https://*.kakao.com https://*.daumcdn.net https://*.supabase.co",
            ].join("; ") + ";",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
