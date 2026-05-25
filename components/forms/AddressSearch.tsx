"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: { address: string; roadAddress: string }) => void;
      }) => { open: () => void };
    };
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => { setCenter: (latlng: unknown) => void };
        Marker: new (options: {
          map: unknown;
          position: unknown;
        }) => {
          setPosition: (pos: unknown) => void;
          setMap: (map: unknown) => void;
        };
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (
                result: { x: string; y: string }[],
                status: string
              ) => void
            ) => void;
          };
          Status: { OK: string };
        };
      };
    };
  }
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string) => void;
}

export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [address, setAddress] = useState(value);

  const handleSearch = () => {
    const open = () => {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const addr = data.roadAddress || data.address;
          onChange(addr);
          setAddress(addr);
        },
      }).open();
    };

    if (window.daum?.Postcode) {
      open();
    } else {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = open;
      document.head.appendChild(script);
    }
  };

  // 외부 value 변경 동기화
  useEffect(() => {
    setAddress(value);
  }, [value]);

  // SDK 로드 대기
  useEffect(() => {
    const waitForKakao = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => setSdkLoaded(true));
      } else {
        setTimeout(waitForKakao, 300);
      }
    };
    waitForKakao();
  }, []);

  // 주소 변경 시 지도 렌더링 — 컨테이너가 visible 된 후 실행
  useEffect(() => {
    if (!sdkLoaded || !address) return;

    // requestAnimationFrame으로 DOM 렌더링 완료 후 실행
    const rafId = requestAnimationFrame(() => {
      if (!mapRef.current) return;

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK) return;

        const coords = new window.kakao.maps.LatLng(
          parseFloat(result[0].y),
          parseFloat(result[0].x)
        );

        if (!mapInstanceRef.current) {
          const map = new window.kakao.maps.Map(mapRef.current!, {
            center: coords,
            level: 3,
          });
          mapInstanceRef.current = map;
          markerRef.current = new window.kakao.maps.Marker({
            map,
            position: coords,
          });
        } else {
          const map = mapInstanceRef.current as {
            setCenter: (c: unknown) => void;
          };
          map.setCenter(coords);
          const marker = markerRef.current as {
            setPosition: (p: unknown) => void;
          };
          marker.setPosition(coords);
        }
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [sdkLoaded, address]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={address}
          readOnly
          placeholder="주소를 검색해주세요"
          className="flex-1"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="h-[52px] px-5 rounded-xl bg-primary text-white text-base font-semibold whitespace-nowrap"
        >
          주소 찾기
        </button>
      </div>
      {address && (
        <div
          ref={mapRef}
          style={{ width: "100%", height: "200px" }}
          className="rounded-lg overflow-hidden border border-border"
        />
      )}
    </div>
  );
}
