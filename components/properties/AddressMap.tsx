"use client";

import { useEffect, useRef } from "react";

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

let kakaoMapsReady: Promise<void> | null = null;

function ensureKakaoMaps(): Promise<void> {
  if (kakaoMapsReady) return kakaoMapsReady;

  kakaoMapsReady = (async () => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key) throw new Error("NEXT_PUBLIC_KAKAO_JS_KEY is not set");

    await loadScript(
      `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`,
      "kakao-map-sdk"
    );

    await new Promise<void>((resolve) => {
      window.kakao.maps.load(() => resolve());
    });
  })();

  return kakaoMapsReady;
}

export default function AddressMap({ address }: { address: string }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    ensureKakaoMaps().then(() => {
      if (cancelled || !mapRef.current) return;

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (cancelled || !mapRef.current) return;
        if (status !== window.kakao.maps.services.Status.OK) return;

        const coords = new window.kakao.maps.LatLng(
          parseFloat(result[0].y),
          parseFloat(result[0].x)
        );

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: coords,
          level: 3,
        });

        new window.kakao.maps.Marker({ map, position: coords });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "200px" }}
      className="rounded-lg overflow-hidden border border-border"
    />
  );
}
