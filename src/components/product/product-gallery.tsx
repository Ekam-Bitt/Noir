"use client";

import { useState } from "react";

import type { ProductImage } from "@/lib/types";
import { GradientPanel } from "@/components/ui/gradient-panel";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selected, setSelected] = useState(images[0] ?? null);

  if (!selected) return null;

  return (
    <div className="space-y-4">
      <GradientPanel palette={selected.palette} label={selected.label} className="aspect-[4/5]" />
      <div className="grid grid-cols-3 gap-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelected(image)}
            className={cn(
              "rounded-[1.4rem] border border-transparent p-0.5 transition",
              selected.id === image.id ? "border-[#f1ddc7]" : "border-[#2c2825]",
            )}
          >
            <GradientPanel palette={image.palette} className="aspect-square rounded-[1.2rem]" />
          </button>
        ))}
      </div>
    </div>
  );
}
