"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { storedImageUrl } from "@/lib/project-images";
import { useFadeInOnScroll } from "@/lib/use-fade-in-on-scroll";

type CardVariant = "hero" | "square" | "portrait" | "wide";

function packagingVariant(index: number): CardVariant {
  if (index === 0) return "hero";

  const gridIndex = index - 1;
  if (gridIndex % 4 === 2) return "wide";
  return gridIndex % 2 === 0 ? "square" : "portrait";
}

export function WorkPackagingImages({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const srcs = images.map(storedImageUrl);
  const rootRef = useRef<HTMLDivElement>(null);
  useFadeInOnScroll(rootRef, ".packaging-card", [images]);

  if (srcs.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  return (
    <div ref={rootRef} className="packaging-images">
      {srcs.map((src, index) => (
        <figure
          key={`${src}-${index}`}
          className={`packaging-card work-fade-card packaging-card--${packagingVariant(index)}`}
        >
          <img
            src={src}
            alt={alt}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </figure>
      ))}
    </div>
  );
}
