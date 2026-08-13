/* eslint-disable @next/next/no-img-element */

export function WorkImageColumns({
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

  return (
    <div className="work-image-masonry p-3">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={alt}
          loading={index === 0 ? "eager" : "lazy"}
          className="work-image-masonry-item"
        />
      ))}
    </div>
  );
}
