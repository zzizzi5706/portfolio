"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFadeInOnScroll } from "@/lib/use-fade-in-on-scroll";

const SLICE_COUNT = 3;
const FALLBACK_LONG_IMAGE = "/placeholders/detail-page-long.jpg";

export function DetailPageLayout({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const naturalRef = useRef({ width: 0, height: 0 });
  const [sliceHeight, setSliceHeight] = useState<number | null>(null);
  useFadeInOnScroll(rootRef, ".detail-page-split-card", [images]);

  const src = images[0] || FALLBACK_LONG_IMAGE;

  const measure = useCallback(() => {
    const card = cardRef.current;
    const { width, height } = naturalRef.current;
    if (!card || !width || !height || card.clientWidth === 0) return;
    setSliceHeight(((height / width) * card.clientWidth) / SLICE_COUNT);
  }, []);

  function rememberNaturalSize(image: HTMLImageElement) {
    if (!image.naturalWidth) return;
    naturalRef.current = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    measure();
  }

  useEffect(() => {
    const image = cardRef.current?.querySelector("img");
    if (image?.complete) rememberNaturalSize(image);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, measure]);

  if (!src) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  return (
    <div ref={rootRef} className="detail-page-split">
      {[0, 1, 2].map((index) => (
        <figure
          key={`${src}-${index}`}
          ref={index === 0 ? cardRef : undefined}
          className="detail-page-split-card work-fade-card"
          style={sliceHeight ? { height: sliceHeight } : undefined}
        >
          <img
            src={src}
            alt={alt}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onLoad={(event) => rememberNaturalSize(event.currentTarget)}
            style={
              sliceHeight
                ? { marginTop: `-${index * sliceHeight}px` }
                : undefined
            }
          />
        </figure>
      ))}
    </div>
  );
}
