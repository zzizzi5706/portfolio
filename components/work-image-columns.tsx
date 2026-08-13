"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

function columnCountForWidth(width: number) {
  if (width >= 1200) return 5;
  if (width >= 768) return 3;
  return 2;
}

function splitIntoColumns(images: string[], count: number) {
  const columns = Array.from({ length: count }, () => [] as string[]);
  images.forEach((src, index) => {
    columns[index % count].push(src);
  });
  return columns;
}

export function WorkImageColumns({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const update = () => setCount(columnCountForWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  const columns = splitIntoColumns(images, count);

  return (
    <div className="work-image-cols" data-columns={count}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="work-image-col">
          {column.map((src, imageIndex) => (
            <img
              key={src}
              src={src}
              alt={alt}
              loading={columnIndex === 0 && imageIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              className="work-image-item"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
