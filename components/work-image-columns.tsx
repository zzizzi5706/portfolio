/* eslint-disable @next/next/no-img-element */
import { masonryColumnCount, splitImagesRoundRobin } from "@/lib/masonry";
import { storedImageUrl } from "@/lib/project-images";

export function WorkImageColumns({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const srcs = images.map(storedImageUrl);
  if (srcs.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  const columnCount = masonryColumnCount(srcs.length);
  const columns = splitImagesRoundRobin(srcs, columnCount);

  return (
    <div className="work-masonry" data-columns={columnCount}>
      {columns.map((columnImages, columnIndex) => (
        <div key={columnIndex} className="work-masonry-col">
          {columnImages.map((src, imageIndex) => (
            <img
              key={src}
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
