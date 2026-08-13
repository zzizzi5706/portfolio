"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  distributeMasonry,
  masonryColumnCount,
  minColumnWidthFor,
} from "@/lib/masonry";

type SizedImage = {
  src: string;
  ratio: number;
};

function loadImageRatio(src: string): Promise<SizedImage> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      const ratio =
        image.naturalWidth > 0 ? image.naturalHeight / image.naturalWidth : 1;
      resolve({ src, ratio });
    };
    image.onerror = () => resolve({ src, ratio: 1 });
    image.src = src;
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
  const [sized, setSized] = useState<SizedImage[]>([]);

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

    Promise.all(sources.map(loadImageRatio)).then((next) => {
      if (!cancelled) setSized(next);
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
  const columns = useMemo(() => {
    if (!sized.length || !innerWidth) return [];
    const columnWidth = Math.max(
      1,
      (innerWidth - gap * Math.max(0, columnCount - 1)) / columnCount,
    );
    return distributeMasonry(sized, columnCount, gap / columnWidth);
  }, [sized, columnCount, innerWidth]);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  return (
    <div ref={containerRef} className="work-masonry" data-columns={columnCount}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="work-masonry-col">
          {column.map((image, imageIndex) => (
            <img
              key={image.src}
              src={image.src}
              alt={alt}
              loading={columnIndex === 0 && imageIndex === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
