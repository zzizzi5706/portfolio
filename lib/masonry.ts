export const MASONRY_TARGET_WIDTH = 220;

export function masonryColumnCount(containerWidth: number, _imageCount = 0) {
  const calculated = Math.max(
    1,
    Math.floor(Math.max(containerWidth, 0) / MASONRY_TARGET_WIDTH),
  );
  return Math.max(3, calculated);
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
