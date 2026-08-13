export const MASONRY_TARGET_WIDTH = 220;
export const MASONRY_MIN_COLUMNS = 3;
export const MASONRY_MAX_COLUMNS_WHEN_FEW = 4;
export const MASONRY_FEW_IMAGE_LIMIT = 10;

export function masonryColumnCount(containerWidth: number, imageCount = 0) {
  const byWidth = Math.max(
    1,
    Math.floor(Math.max(containerWidth, 0) / MASONRY_TARGET_WIDTH),
  );
  let count = Math.max(MASONRY_MIN_COLUMNS, byWidth);

  if (imageCount > 0 && imageCount < MASONRY_FEW_IMAGE_LIMIT) {
    count = Math.min(count, MASONRY_MAX_COLUMNS_WHEN_FEW);
    count = Math.min(count, Math.max(MASONRY_MIN_COLUMNS, Math.ceil(imageCount / 2)));
  }

  return count;
}

export function shortestColumnIndex(heights: number[]) {
  let index = 0;
  for (let i = 1; i < heights.length; i += 1) {
    if (heights[i] < heights[index]) index = i;
  }
  return index;
}

export function distributeMasonry<T extends { ratio: number }>(
  items: T[],
  columnCount: number,
  gapRatio = 0,
) {
  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  const heights = Array(columnCount).fill(0);

  items.forEach((item) => {
    const shortestIndex = shortestColumnIndex(heights);
    columns[shortestIndex].push(item);
    heights[shortestIndex] += item.ratio + gapRatio;
  });

  return columns;
}
