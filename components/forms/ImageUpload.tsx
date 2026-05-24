"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/types/property";

const MAX_IMAGES = 3;

interface ImageUploadProps {
  existingImages?: PropertyImage[];
  onChange: (newFiles: File[], deletedImageIds: string[]) => void;
}

export default function ImageUpload({
  existingImages = [],
  onChange,
}: ImageUploadProps) {
  const [existing, setExisting] = useState(existingImages);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<
    { file: File; url: string }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = existing.length + newPreviews.length;

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const remaining = MAX_IMAGES - totalCount;
    const toAdd = selected.slice(0, remaining);

    const added = toAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const updatedNew = [...newPreviews, ...added];
    setNewPreviews(updatedNew);
    onChange(
      updatedNew.map((p) => p.file),
      deletedIds
    );

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemoveExisting = (img: PropertyImage) => {
    const updatedExisting = existing.filter((e) => e.id !== img.id);
    const updatedDeletedIds = [...deletedIds, img.id];
    setExisting(updatedExisting);
    setDeletedIds(updatedDeletedIds);
    onChange(
      newPreviews.map((p) => p.file),
      updatedDeletedIds
    );
  };

  const handleRemoveNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index].url);
    const updatedNew = newPreviews.filter((_, i) => i !== index);
    setNewPreviews(updatedNew);
    onChange(
      updatedNew.map((p) => p.file),
      deletedIds
    );
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {/* 기존 이미지 */}
        {existing.map((img) => (
          <div
            key={img.id}
            className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
          >
            <Image
              src={img.image_url}
              alt="기존 사진"
              fill
              className="object-cover"
              sizes="112px"
            />
            <button
              type="button"
              onClick={() => handleRemoveExisting(img)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ))}

        {/* 새 이미지 */}
        {newPreviews.map((preview, i) => (
          <div
            key={`new-${i}`}
            className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
          >
            <Image
              src={preview.url}
              alt={`새 사진 ${i + 1}`}
              fill
              className="object-cover"
              sizes="112px"
            />
            <button
              type="button"
              onClick={() => handleRemoveNew(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ))}

        {totalCount < MAX_IMAGES && (
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
              {totalCount}/{MAX_IMAGES}
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
