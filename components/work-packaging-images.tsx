"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";

type CardVariant = "hero" | "square" | "portrait" | "wide";

function packagingVariant(index: number): CardVariant {
  if (index === 0) return "hero";

  const gridIndex = index - 1;
  if (gridIndex % 4 === 2) return "wide";
  return gridIndex % 2 === 0 ? "square" : "portrait";
}

export function WorkPackagingImages({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = root.querySelectorAll<HTMLElement>(".packaging-card");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        visible.forEach((entry, i) => {
          const card = entry.target as HTMLElement;
          card.style.transitionDelay = `${i * 70}ms`;
          card.classList.add("is-visible");
          observer.unobserve(card);
        });
      },
      { threshold: 0.15 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [images]);

  if (images.length === 0) {
    return (
      <p className="px-6 py-24 text-sm text-neutral-400">이미지가 없습니다.</p>
    );
  }

  return (
    <div ref={rootRef} className="packaging-images">
      {images.map((src, index) => (
        <figure
          key={`${src}-${index}`}
          className={`packaging-card packaging-card--${packagingVariant(index)}`}
        >
          <img
            src={src}
            alt={alt}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </figure>
      ))}
    </div>
  );
}
