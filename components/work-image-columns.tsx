"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function columnCount(width: number, imageCount: number) {
  if (width < 768) return 1;
  if (width < 1024) return 2;
  if (imageCount <= 3) return Math.min(3, Math.max(1, imageCount));
  if (imageCount <= 10) return 4;
  return 5;
}

function splitColumns(images: string[], count: number) {
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
  const [count, setCount] = useState(1);

  useEffect(() => {
    const update = () => setCount(columnCount(window.innerWidth, images.length));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  const columns = splitColumns(images, count);

  return (
    <div className="flex items-start gap-4 px-4 py-4 md:gap-5 md:px-5 md:py-5">
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex min-w-0 flex-1 flex-col gap-2 md:max-w-[280px]"
        >
          {column.map((src, imageIndex) => {
            const index = imageIndex * count + columnIndex;
            return (
              <Image
                key={src}
                src={src}
                alt={alt}
                width={560}
                height={800}
                className="block h-auto w-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 280px"
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
