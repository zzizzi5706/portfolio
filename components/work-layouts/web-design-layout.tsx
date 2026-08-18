"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { ImageLightboxRoot } from "@/components/image-lightbox";
import { splitImagesRoundRobin } from "@/lib/masonry";
import { storedImageUrl } from "@/lib/project-images";
import { useFadeInOnScroll } from "@/lib/use-fade-in-on-scroll";

const COLUMN_COUNT = 2;

export function WebDesignLayout({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const srcs = images.map(storedImageUrl);
  const rootRef = useRef<HTMLDivElement>(null);
  useFadeInOnScroll(rootRef, ".work-fade-card", [images]);

  if (srcs.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  const columns = splitImagesRoundRobin(srcs, COLUMN_COUNT);

  return (
    <ImageLightboxRoot images={srcs} alt={alt}>
      {(open) => (
        <div ref={rootRef} className="web-design-columns">
          {columns.map((columnImages, columnIndex) => (
            <div key={columnIndex} className="web-design-column">
              {columnImages.map((src, imageIndex) => {
                const originalIndex = imageIndex * COLUMN_COUNT + columnIndex;
                return (
                  <button
                    key={`${src}-${imageIndex}`}
                    type="button"
                    className="lightbox-trigger work-fade-card"
                    onClick={() => open(originalIndex)}
                    aria-label={`${alt} 확대 보기`}
                  >
                    <img
                      src={src}
                      alt={alt}
                      loading={columnIndex === 0 && imageIndex === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </ImageLightboxRoot>
  );
}
