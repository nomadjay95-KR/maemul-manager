"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 3;

interface ImageUploadProps {
  onChange: (files: File[]) => void;
}

export default function ImageUpload({ onChange }: ImageUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const remaining = MAX_IMAGES - previews.length;
    const toAdd = selected.slice(0, remaining);

    const newPreviews = toAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onChange(updated.map((p) => p.file));

    // reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange(updated.map((p) => p.file));
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {previews.map((preview, i) => (
          <div
            key={i}
            className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
          >
            <Image
              src={preview.url}
              alt={`사진 ${i + 1}`}
              fill
              className="object-cover"
              sizes="112px"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ))}

        {previews.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "w-28 h-28 flex-shrink-0 rounded-lg border-2 border-dashed border-border",
              "flex flex-col items-center justify-center gap-1",
              "text-muted-foreground hover:border-foreground/50 hover:text-foreground/70 transition-colors"
            )}
          >
            <span className="text-2xl">+</span>
            <span className="text-xs">
              {previews.length}/{MAX_IMAGES}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}
