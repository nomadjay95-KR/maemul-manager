import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: false,
  workboxOptions: {
    runtimeCaching: [
      // RSC 페이로드 - NetworkFirst
      {
        urlPattern: /^\/_next\/data\/.+\.json$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "next-data",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      // API GET 응답 (캘린더, 매물 목록 등) - NetworkFirst
      {
        urlPattern: /^\/api\/.+$/i,
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      // Supabase Storage 이미지/서류 - 캐싱 제외
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
        handler: "NetworkOnly",
      },
      // Kakao CDN - 캐싱 제외
      {
        urlPattern:
          /^https:\/\/(t1\.kakaocdn\.net|dapi\.kakao\.com|.*\.daumcdn\.net)\/.*/i,
        handler: "NetworkOnly",
      },
    ],
  },
});

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
            value:
              [
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.daumcdn.net https://*.daumcdn.net https://dapi.kakao.com https://*.kakao.com https://t1.kakaocdn.net https://*.kakaocdn.net",
                "worker-src 'self'",
                "frame-src 'self' https://postcode.map.daum.net https://*.daumcdn.net https://*.kakao.com",
                "frame-ancestors 'self' https://*.kakao.com https://*.daumcdn.net",
                "img-src 'self' data: blob: https://*.daumcdn.net https://map.kakao.com https://*.kakao.com https://*.supabase.co",
                "connect-src 'self' https://*.kakao.com https://*.daumcdn.net https://*.kakaocdn.net https://*.supabase.co",
              ].join("; ") + ";",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
