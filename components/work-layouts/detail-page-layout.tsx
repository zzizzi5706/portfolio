"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { splitImagesRoundRobin } from "@/lib/masonry";
import { useFadeInOnScroll } from "@/lib/use-fade-in-on-scroll";

const COLUMN_COUNT = 3;

export function DetailPageLayout({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useFadeInOnScroll(rootRef, ".detail-page-card", [images]);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  const columns = splitImagesRoundRobin(images, COLUMN_COUNT);

  return (
    <div ref={rootRef} className="detail-page-columns">
      {columns.map((columnImages, columnIndex) => (
        <div key={columnIndex} className="detail-page-col">
          {columnImages.map((src, imageIndex) => {
            const order = columnIndex + imageIndex * COLUMN_COUNT;
            return (
              <figure
                key={`${src}-${order}`}
                className="detail-page-card work-fade-card"
              >
                <img
                  src={src}
                  alt={alt}
                  loading={order === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
}
