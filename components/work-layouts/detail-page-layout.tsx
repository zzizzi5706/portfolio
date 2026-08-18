/* eslint-disable @next/next/no-img-element */
import { detailPageColumnCount, splitImagesRoundRobin } from "@/lib/masonry";

export function DetailPageLayout({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  const columnCount = detailPageColumnCount(images.length);
  const columns = splitImagesRoundRobin(images, columnCount);

  return (
    <div
      className="detail-page-columns"
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {columns.map((columnImages, columnIndex) => (
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
