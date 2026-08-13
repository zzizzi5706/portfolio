export function masonryColumnCount(imageCount: number) {
  if (imageCount <= 0) return 2;
  return Math.min(5, Math.max(2, Math.ceil(imageCount / 3)));
}

export function splitImagesRoundRobin<T>(images: T[], columnCount: number) {
  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  images.forEach((image, index) => {
    columns[index % columnCount].push(image);
  });
  return columns;
}
