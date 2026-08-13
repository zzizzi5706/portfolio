import {
  distributeImagesToColumns,
  masonryColumnCount,
  minColumnWidthFor,
} from "./masonry";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(masonryColumnCount(1200, 20) === 8, "wide container with many images uses up to 8 columns");
assert(masonryColumnCount(883, 20) === 5, "150px minimum width limits columns on a mid pane");
assert(masonryColumnCount(1200, 3) === 3, "three images stay at three columns");
assert(masonryColumnCount(400, 20) === 3, "narrow width still keeps three columns");
assert(minColumnWidthFor(390) === 100, "narrow viewports use a smaller min column width");

const trap = distributeImagesToColumns(
  [
    { url: "tall", width: 100, height: 300 },
    { url: "a", width: 100, height: 20 },
    { url: "b", width: 100, height: 20 },
  ],
  2,
  100,
);
assert(trap.columns[0].map((item) => item.url).join() === "tall", "tall image stays alone");
assert(
  trap.columns[1].map((item) => item.url).join() === "a,b",
  "short images stack on the shorter column instead of filling in order",
);
assert(trap.columnHeights[0] === 300, "uses rendered pixel height, not round-robin");
assert(trap.columnHeights[1] === 40, "stacks both short images in the short column");

const many = Array.from({ length: 20 }, (_, index) => ({
  url: String(index),
  width: 100,
  height: 140,
}));
const few = distributeImagesToColumns(many, 3, 100);
const packed = distributeImagesToColumns(many, 8, 100);
assert(
  Math.max(...packed.columnHeights) < Math.max(...few.columnHeights),
  "more columns reduce the tallest stack for many images",
);

console.log("masonry tests passed");
