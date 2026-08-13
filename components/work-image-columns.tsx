"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  distributeImagesToColumns,
  masonryColumnCount,
  minColumnWidthFor,
  type MasonryImage,
} from "@/lib/masonry";

function loadImageSize(url: string): Promise<MasonryImage> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      resolve({
        url,
        width: image.naturalWidth || 1,
        height: image.naturalHeight || 1,
      });
    };
    image.onerror = () => resolve({ url, width: 1, height: 1 });
    image.src = url;
  });
}

export function WorkImageColumns({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [sized, setSized] = useState<MasonryImage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => setContainerWidth(node.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const imageKey = images.join("|");

  useEffect(() => {
    const sources = imageKey ? imageKey.split("|") : [];
    let cancelled = false;
    setSized([]);
    setLoaded(false);

    Promise.all(sources.map(loadImageSize)).then((next) => {
      if (!cancelled) {
        setSized(next);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageKey]);

  const paddingX = 56;
  const gap = 16;
  const innerWidth = Math.max(0, containerWidth - paddingX);
  const columnCount = masonryColumnCount(
    innerWidth,
    sized.length,
    minColumnWidthFor(containerWidth),
  );
  const layout = useMemo(() => {
    if (!sized.length || !innerWidth) {
      return { columns: [] as MasonryImage[][], columnHeights: [] as number[] };
    }
    const columnWidthPx = Math.max(
      1,
      (innerWidth - gap * Math.max(0, columnCount - 1)) / columnCount,
    );
    return distributeImagesToColumns(sized, columnCount, columnWidthPx, gap);
  }, [sized, columnCount, innerWidth]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !layout.columnHeights.length) {
      return;
    }
    console.log("[masonry] columnHeights(px)", layout.columnHeights.map((h) => Math.round(h)));
    console.log(
      "[masonry] per-column image counts",
      layout.columns.map((column) => column.length),
    );
  }, [layout]);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  return (
    <div ref={containerRef} className="work-masonry" data-columns={columnCount}>
      {!loaded ? (
        <p className="py-16 text-sm text-neutral-400">이미지를 불러오는 중…</p>
      ) : (
        layout.columns.map((columnImages, columnIndex) => (
          <div key={columnIndex} className="work-masonry-col">
            {columnImages.map((image, imageIndex) => (
              <img
                key={image.url}
                src={image.url}
                alt={alt}
                width={image.width}
                height={image.height}
                loading={columnIndex === 0 && imageIndex === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
