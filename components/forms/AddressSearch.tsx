"use client";

import { useEffect, useRef } from "react";
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
        }) => { setPosition: (pos: unknown) => void; setMap: (map: unknown) => void };
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

  const handleSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.roadAddress || data.address;
        onChange(addr);
      },
    }).open();
  };

  useEffect(() => {
    if (!value || !mapRef.current) return;

    const renderMap = () => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(value, (result, status) => {
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
          const marker = new window.kakao.maps.Marker({
            map,
            position: coords,
          });
          markerRef.current = marker;
        } else {
          const map = mapInstanceRef.current as { setCenter: (c: unknown) => void };
          map.setCenter(coords);
          const marker = markerRef.current as { setPosition: (p: unknown) => void };
          marker.setPosition(coords);
        }
      });
    };

    if (window.kakao?.maps) {
      window.kakao.maps.load(renderMap);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
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
      {value && (
        <div
          ref={mapRef}
          className="w-full h-[200px] rounded-lg overflow-hidden border border-border"
        />
      )}
    </div>
  );
}
