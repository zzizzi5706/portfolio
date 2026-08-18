"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";

const COLUMN_COUNT = 3;
const COLUMN_GAP = 18;
const IMAGE_GAP = 4;
const PADDING_X = 40;
const HEIGHT_TIE_PX = 20;

type SizedImage = {
  src: string;
  width: number;
  height: number;
};

function loadImageSize(src: string): Promise<SizedImage> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      resolve({
        src,
        width: image.naturalWidth || 1,
        height: image.naturalHeight || 1,
      });
    };
    image.onerror = () => resolve({ src, width: 1, height: 1 });
    image.src = src;
  });
}

function sequentialColumns(images: string[]) {
  const columns: string[][] = Array.from({ length: COLUMN_COUNT }, () => []);
  images.forEach((src, index) => {
    columns[index].push(src);
  });
  return columns;
}

function distributeToShortestColumns(
  images: SizedImage[],
  columnWidth: number,
) {
  const columns: SizedImage[][] = Array.from({ length: COLUMN_COUNT }, () => []);
  const heights = Array(COLUMN_COUNT).fill(0);

  for (const image of images) {
    const renderedHeight = columnWidth * (image.height / image.width);
    const minHeight = Math.min(...heights);
    let targetIndex = 0;
    for (let i = 0; i < COLUMN_COUNT; i += 1) {
      if (heights[i] <= minHeight + HEIGHT_TIE_PX) {
        targetIndex = i;
        break;
      }
    }
    if (columns[targetIndex].length > 0) {
      heights[targetIndex] += IMAGE_GAP;
    }
    columns[targetIndex].push(image);
    heights[targetIndex] += renderedHeight;
  }

  return columns;
}

export function DetailPageLayout({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [sized, setSized] = useState<SizedImage[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const update = () => setContainerWidth(node.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const useMasonry = images.length > COLUMN_COUNT;
  const imagesKey = images.join("\0");

  useEffect(() => {
    if (!useMasonry) {
      setReady(true);
      setSized([]);
      return;
    }

    let cancelled = false;
    setReady(false);
    setSized([]);
    const sources = imagesKey ? imagesKey.split("\0") : [];

    Promise.all(sources.map(loadImageSize)).then((next) => {
      if (!cancelled) {
        setSized(next);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imagesKey, useMasonry]);

  const innerWidth = Math.max(0, containerWidth - PADDING_X);
  const columnWidth = Math.max(
    1,
    (innerWidth - COLUMN_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT,
  );
  const masonryColumns = useMemo(() => {
    if (!useMasonry || !ready || !sized.length || !containerWidth) {
      return Array.from({ length: COLUMN_COUNT }, () => [] as SizedImage[]);
    }
    return distributeToShortestColumns(sized, columnWidth);
  }, [useMasonry, ready, sized, containerWidth, columnWidth]);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  if (!useMasonry) {
    return (
      <div className="detail-page-columns">
        {sequentialColumns(images).map((columnImages, columnIndex) => (
          <div key={columnIndex} className="detail-page-column">
            {columnImages.map((src, imageIndex) => (
              <img
                key={`${src}-${imageIndex}`}
                src={src}
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

  return (
    <div ref={rootRef} className="detail-page-columns">
      {!ready || !containerWidth ? (
        <>
          {Array.from({ length: COLUMN_COUNT }).map((_, index) => (
            <div key={index} className="detail-page-column detail-page-column--pending" />
          ))}
        </>
      ) : (
        masonryColumns.map((columnImages, columnIndex) => (
          <div key={columnIndex} className="detail-page-column">
            {columnImages.map((image, imageIndex) => (
              <img
                key={`${image.src}-${imageIndex}`}
                src={image.src}
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
