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
import { storedImageUrl, type ImageSize } from "@/lib/project-images";

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
  imageSizes,
  alt,
}: {
  images: string[];
  imageSizes?: (ImageSize | null)[];
  alt: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const srcs = useMemo(() => images.map(storedImageUrl), [images]);
  const [fallbackSizes, setFallbackSizes] = useState<(ImageSize | null)[] | null>(
    null,
  );
  const [columnWidth, setColumnWidth] = useState(0);
  const columnCount = detailPageColumnCount(srcs.length);
  const storedComplete =
    srcs.length > 0 &&
    (imageSizes?.length ?? 0) >= srcs.length &&
    srcs.every((_, index) => Boolean(imageSizes?.[index]?.width && imageSizes?.[index]?.height));

  useEffect(() => {
    if (storedComplete || srcs.length === 0) {
      setFallbackSizes(null);
      return;
    }
    let cancelled = false;
    void Promise.all(
      srcs.map(async (src, index) => {
        const stored = imageSizes?.[index];
        if (stored?.width && stored.height) return stored;
        return loadImageSize(src);
      }),
    ).then((next) => {
      if (!cancelled) setFallbackSizes(next);
    });
    return () => {
      cancelled = true;
    };
  }, [imageSizes, srcs, storedComplete]);

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

  const resolvedSizes = storedComplete
    ? (imageSizes as ImageSize[])
    : fallbackSizes;

  const columns = useMemo(() => {
    if (!resolvedSizes || resolvedSizes.length !== srcs.length || columnWidth <= 0) {
      return Array.from({ length: columnCount }, () => [] as ColumnImage[]);
    }

    return splitImagesByTargetHeight(
      srcs.map((src, originalIndex) => ({
        item: { src, originalIndex },
        height: renderedImageHeight(
          resolvedSizes[originalIndex]!.width,
          resolvedSizes[originalIndex]!.height,
          columnWidth,
        ),
      })),
      columnCount,
      DETAIL_PAGE_IMAGE_GAP,
    );
  }, [columnCount, columnWidth, srcs, resolvedSizes]);

  if (srcs.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  return (
    <ImageLightboxRoot images={srcs} alt={alt}>
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
