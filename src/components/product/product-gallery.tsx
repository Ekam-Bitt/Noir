"use client";

import Image from "next/image";
import { useState } from "react";

import { GradientPanel } from "@/components/ui/gradient-panel";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selected, setSelected] = useState(images[0] ?? null);

  if (!selected) return null;

  return (
    <div className="space-y-3">
      <div className="grid gap-px bg-white/8 md:grid-cols-[92px_1fr]">
        <div className="hidden gap-px bg-white/8 md:grid md:auto-rows-fr">
          {images.map((image) => (
            <button key={image.id} type="button" onClick={() => setSelected(image)} className="bg-[#120f0d] p-1">
              <div
                className={cn(
                  "relative aspect-[4/5] overflow-hidden border transition",
                  selected.id === image.id ? "border-[#f1ddc7]" : "border-transparent",
                )}
              >
                {image.url ? (
                  <Image src={image.url} alt={image.alt ?? image.label} fill sizes="92px" className="object-cover" />
                ) : (
                  <GradientPanel palette={image.palette} className="aspect-[4/5]" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-[#120f0d] p-1">
          {selected.url ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-[#161210]">
              <Image
                src={selected.url}
                alt={selected.alt ?? selected.label}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ) : (
            <GradientPanel palette={selected.palette} label={selected.label} className="aspect-[4/5]" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 md:hidden">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelected(image)}
            className={cn(
              "border p-0.5 transition",
              selected.id === image.id ? "border-[#f1ddc7]" : "border-white/8",
            )}
          >
            {image.url ? (
              <div className="relative aspect-square overflow-hidden bg-[#161210]">
                <Image src={image.url} alt={image.alt ?? image.label} fill sizes="25vw" className="object-cover" />
              </div>
            ) : (
              <GradientPanel palette={image.palette} className="aspect-square" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
