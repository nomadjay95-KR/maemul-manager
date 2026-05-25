"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";

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
    try {
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if (!key) throw new Error("NEXT_PUBLIC_KAKAO_JS_KEY is not set");

      await loadScript(
        `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`,
        "kakao-map-sdk"
      );

      await new Promise<void>((resolve) => {
        window.kakao.maps.load(() => resolve());
      });
    } catch (err) {
      kakaoMapsReady = null;
      throw err;
    }
  })();

  return kakaoMapsReady;
}

export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [address, setAddress] = useState(value);
  const { toast } = useToast();

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
      loadScript(
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
        "daum-postcode-sdk"
      )
        .then(open)
        .catch(() => {
          toast("주소 검색 기능을 불러올 수 없습니다. 페이지를 새로고침 해주세요", "error");
        });
    }
  };

  const renderMap = useCallback((addr: string) => {
    if (!mapRef.current) return;

    ensureKakaoMaps()
    .then(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(addr, (result, status) => {
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
    })
    .catch(() => {
      // 지도 로드 실패는 조용히 무시 (주소 검색은 이미 완료됨)
    });
  }, []);

  // 외부 value 변경 동기화
  useEffect(() => {
    setAddress(value);
  }, [value]);

  // 주소 변경 시 지도 렌더링
  useEffect(() => {
    if (!address) return;
    renderMap(address);
  }, [address, renderMap]);

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
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "200px",
          display: address ? "block" : "none",
        }}
        className="rounded-lg overflow-hidden border border-border"
      />
    </div>
  );
}
