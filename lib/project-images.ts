export type StoredProjectImage = {
  url: string;
  width?: number;
  height?: number;
};

export type ImageSize = {
  width: number;
  height: number;
};

export function parseStoredImage(value: unknown): StoredProjectImage {
  if (value && typeof value === "object" && "url" in value) {
    const parsed = value as { url?: unknown; width?: unknown; height?: unknown };
    if (typeof parsed.url === "string" && parsed.url) {
      const width = Number(parsed.width);
      const height = Number(parsed.height);
      return {
        url: parsed.url,
        width: width > 0 ? width : undefined,
        height: height > 0 ? height : undefined,
      };
    }
  }

  if (typeof value !== "string" || !value) return { url: "" };
  const trimmed = value.trim();
  if (trimmed.startsWith("{")) {
    try {
      return parseStoredImage(JSON.parse(trimmed));
    } catch {
      /* fall through */
    }
  }
  return { url: value };
}

export function serializeStoredImage(image: StoredProjectImage) {
  if (image.width && image.height) {
    return JSON.stringify({
      url: image.url,
      width: image.width,
      height: image.height,
    });
  }
  return image.url;
}

export function storedImageUrl(value: unknown) {
  return parseStoredImage(value).url;
}

export function storedImageSize(value: unknown): ImageSize | null {
  const parsed = parseStoredImage(value);
  if (parsed.width && parsed.height) {
    return { width: parsed.width, height: parsed.height };
  }
  return null;
}

export function projectImageList(images: unknown[] | null | undefined) {
  return (images ?? [])
    .map((item) => parseStoredImage(item))
    .filter((item) => item.url);
}
