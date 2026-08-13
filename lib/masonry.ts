export const MASONRY_TARGET_WIDTH = 220;

export function masonryColumnCount(containerWidth: number, imageCount: number) {
  if (containerWidth <= 0 || imageCount <= 0) return 1;
  const maxByWidth = Math.max(
    1,
    Math.floor(containerWidth / MASONRY_TARGET_WIDTH),
  );
  const maxByContent = Math.max(1, Math.ceil(imageCount / 2));
  return Math.min(imageCount, maxByWidth, maxByContent);
}

export function distributeMasonry<T extends { ratio: number }>(
  items: T[],
  columnCount: number,
) {
  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  const heights = Array(columnCount).fill(0);

  items.forEach((item) => {
    const shortestIndex = heights.indexOf(Math.min(...heights));
    columns[shortestIndex].push(item);
    heights[shortestIndex] += item.ratio;
  });

  return columns;
}
