"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ImageLightboxRoot } from "@/components/image-lightbox";
import {
  DETAIL_PAGE_IMAGE_GAP,
  detailPageColumnCount,
  renderedImageHeight,
  splitImagesByTargetHeight,
} from "@/lib/masonry";

type ImageSize = {
  width: number;
  height: number;
};

type ColumnImage = {
  src: string;
  originalIndex: number;
};

function loadImageSize(src: string) {
  return new Promise<ImageSize>((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        width: Math.max(1, image.naturalWidth),
        height: Math.max(1, image.naturalHeight),
      });
    image.onerror = () => resolve({ width: 1, height: 1 });
    image.src = src;
  });
}

function columnWidthFromContainer(el: HTMLElement, columnCount: number) {
  const style = getComputedStyle(el);
  const padding =
    Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
  const gap = Number.parseFloat(style.columnGap) || 0;
  const inner = el.clientWidth - padding;
  return Math.max(1, (inner - gap * Math.max(0, columnCount - 1)) / columnCount);
}

export function DetailPageLayout({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<ImageSize[] | null>(null);
  const [columnWidth, setColumnWidth] = useState(0);
  const columnCount = detailPageColumnCount(images.length);

  useEffect(() => {
    let cancelled = false;
    if (images.length === 0) {
      setSizes([]);
      return;
    }
    setSizes(null);
    void Promise.all(images.map(loadImageSize)).then((next) => {
      if (!cancelled) setSizes(next);
    });
    return () => {
      cancelled = true;
    };
  }, [images]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      setColumnWidth(columnWidthFromContainer(el, columnCount));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [columnCount]);

  const columns = useMemo(() => {
    if (!sizes || sizes.length !== images.length || columnWidth <= 0) {
      return Array.from({ length: columnCount }, () => [] as ColumnImage[]);
    }

    return splitImagesByTargetHeight(
      images.map((src, originalIndex) => ({
        item: { src, originalIndex },
        height: renderedImageHeight(
          sizes[originalIndex].width,
          sizes[originalIndex].height,
          columnWidth,
        ),
      })),
      columnCount,
      DETAIL_PAGE_IMAGE_GAP,
    );
  }, [columnCount, columnWidth, images, sizes]);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  return (
    <ImageLightboxRoot images={images} alt={alt}>
      {(open) => (
        <div ref={wrapRef} className="detail-page-columns">
          {columns.map((columnImages, columnIndex) => (
            <div key={columnIndex} className="detail-page-column">
              {columnImages.map((image) => (
                <button
                  key={`${image.src}-${image.originalIndex}`}
                  type="button"
                  className="lightbox-trigger"
                  onClick={() => open(image.originalIndex)}
                  aria-label={`${alt} 확대 보기`}
                >
                  <img
                    src={image.src}
                    alt={alt}
                    loading={image.originalIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </ImageLightboxRoot>
  );
}
