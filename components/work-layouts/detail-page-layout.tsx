"use client";

/* eslint-disable @next/next/no-img-element */
import { ImageLightboxRoot } from "@/components/image-lightbox";
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
    <ImageLightboxRoot images={images} alt={alt}>
      {(open) => (
        <div className="detail-page-columns">
          {columns.map((columnImages, columnIndex) => (
            <div key={columnIndex} className="detail-page-column">
              {columnImages.map((src, imageIndex) => {
                const originalIndex = imageIndex * columnCount + columnIndex;
                return (
                  <button
                    key={`${src}-${imageIndex}`}
                    type="button"
                    className="lightbox-trigger"
                    onClick={() => open(originalIndex)}
                    aria-label={`${alt} 확대 보기`}
                  >
                    <img
                      src={src}
                      alt={alt}
                      loading={columnIndex === 0 && imageIndex === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </ImageLightboxRoot>
  );
}
