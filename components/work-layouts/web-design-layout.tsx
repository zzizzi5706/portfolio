/* eslint-disable @next/next/no-img-element */

export function WebDesignLayout({
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
    <div className="web-design-images">
      {images.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt={alt}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
    </div>
  );
}
