export function masonryColumnCount(imageCount: number) {
  if (imageCount <= 0) return 2;
  return Math.min(5, Math.max(2, Math.ceil(imageCount / 3)));
}

export function detailPageColumnCount(imageCount: number) {
  return imageCount >= 13 ? 4 : 3;
}

export const DETAIL_PAGE_IMAGE_GAP = 4;

export function splitImagesRoundRobin<T>(images: T[], columnCount: number) {
  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  images.forEach((image, index) => {
    columns[index % columnCount].push(image);
  });
  return columns;
}

export type SizedColumnItem<T> = {
  item: T;
  height: number;
};

export function renderedImageHeight(
  naturalWidth: number,
  naturalHeight: number,
  columnWidth: number,
) {
  const width = Math.max(1, naturalWidth);
  return (Math.max(1, naturalHeight) / width) * Math.max(1, columnWidth);
}

export function splitImagesByTargetHeight<T>(
  images: SizedColumnItem<T>[],
  columnCount: number,
  gap = 0,
) {
  const count = Math.max(1, columnCount);
  const columns = Array.from({ length: count }, () => [] as T[]);
  if (images.length === 0) return columns;

  const targetHeight =
    images.reduce((sum, image) => sum + image.height, 0) / count;

  let index = 0;
  for (let column = 0; column < count; column += 1) {
    if (column === count - 1) {
      while (index < images.length) {
        columns[column].push(images[index].item);
        index += 1;
      }
      break;
    }

    let accumulated = 0;
    let placed = 0;
    while (index < images.length) {
      const next = images[index];
      const nextHeight = accumulated + (placed > 0 ? gap : 0) + next.height;
      if (placed > 0 && nextHeight > targetHeight) break;
      columns[column].push(next.item);
      accumulated = nextHeight;
      placed += 1;
      index += 1;
    }
  }

  return columns;
}
