export const MIN_COLUMN_WIDTH = 150;
export const MIN_COLUMN_WIDTH_NARROW = 100;
export const MIN_COLUMNS = 3;
export const MAX_COLUMNS = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function minColumnWidthFor(containerWidth: number) {
  return containerWidth < 768 ? MIN_COLUMN_WIDTH_NARROW : MIN_COLUMN_WIDTH;
}

export function masonryColumnCount(
  containerWidth: number,
  imageCount = 0,
  minColumnWidth = MIN_COLUMN_WIDTH,
) {
  const byWidth = Math.floor(Math.max(containerWidth, 0) / minColumnWidth);
  const maxByImages =
    imageCount > 0 ? Math.max(MIN_COLUMNS, imageCount) : MAX_COLUMNS;

  return clamp(byWidth, MIN_COLUMNS, Math.min(MAX_COLUMNS, maxByImages));
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
