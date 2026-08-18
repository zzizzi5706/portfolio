"use client";

/* eslint-disable @next/next/no-img-element */
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ImageLightboxProps = {
  images: string[];
  alt: string;
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

const FADE_MS = 250;

export function ImageLightbox({
  images,
  alt,
  index,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (index !== null) {
      setActiveIndex(index);
      setRender(true);
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setRender(false), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [index]);

  const go = useCallback(
    (direction: -1 | 1) => {
      if (images.length < 2) return;
      const next = (activeIndex + direction + images.length) % images.length;
      setActiveIndex(next);
      onIndexChange(next);
    },
    [activeIndex, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!render) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose, render]);

  if (!mounted || !render) return null;

  const src = images[activeIndex];
  const showNav = images.length > 1;

  return createPortal(
    <div
      className={`image-lightbox${visible ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 확대 보기"
      onClick={onClose}
    >
      <button
        type="button"
        className="image-lightbox-close"
        aria-label="닫기"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
      {showNav ? (
        <button
          type="button"
          className="image-lightbox-nav image-lightbox-prev"
          aria-label="이전 이미지"
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
        >
          ‹
        </button>
      ) : null}
      {src ? (
        <img
          src={src}
          alt={alt}
          className="image-lightbox-photo"
          onClick={(event) => event.stopPropagation()}
        />
      ) : null}
      {showNav ? (
        <button
          type="button"
          className="image-lightbox-nav image-lightbox-next"
          aria-label="다음 이미지"
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
        >
          ›
        </button>
      ) : null}
    </div>,
    document.body,
  );
}

export function ImageLightboxRoot({
  images,
  alt,
  children,
}: {
  images: string[];
  alt: string;
  children: (open: (index: number) => void) => ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      {children((nextIndex) => setIndex(nextIndex))}
      <ImageLightbox
        images={images}
        alt={alt}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </>
  );
}
