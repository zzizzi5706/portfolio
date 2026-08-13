export const MIN_COLUMN_WIDTH = 150;
export const MIN_COLUMN_WIDTH_NARROW = 100;
export const MIN_COLUMNS = 3;
export const MAX_COLUMNS = 8;

export type MasonryImage = {
  url: string;
  width: number;
  height: number;
};

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

/**
 * images: { url, width, height }[] — width/height are intrinsic pixel sizes
 * columnCount: number
 * columnWidthPx: rendered column width
 * gapPx: vertical gap after each image
 *
 * Returns one image list per column. Each image goes into the currently
 * shortest column — never index % columnCount.
 */
export function distributeImagesToColumns(
  images: MasonryImage[],
  columnCount: number,
  columnWidthPx: number,
  gapPx = 0,
) {
  const columns = Array.from({ length: columnCount }, () => [] as MasonryImage[]);
  const columnHeights = new Array(columnCount).fill(0);

  for (const image of images) {
    const renderedHeight =
      image.width > 0 ? columnWidthPx * (image.height / image.width) : columnWidthPx;

    let shortestIndex = 0;
    for (let i = 1; i < columnCount; i += 1) {
      if (columnHeights[i] < columnHeights[shortestIndex]) {
        shortestIndex = i;
      }
    }

    columns[shortestIndex].push(image);
    columnHeights[shortestIndex] += renderedHeight + gapPx;
  }

  return { columns, columnHeights };
}
