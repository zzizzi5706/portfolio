import {
  distributeMasonry,
  masonryColumnCount,
  minColumnWidthFor,
  shortestColumnIndex,
} from "./masonry";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(masonryColumnCount(1200, 20) === 8, "wide container with many images uses up to 8 columns");
assert(masonryColumnCount(883, 20) === 5, "150px minimum width limits columns on a mid pane");
assert(masonryColumnCount(1200, 3) === 3, "three images stay at three columns");
assert(masonryColumnCount(1200, 5) === 5, "five images cap columns at the image count");
assert(masonryColumnCount(400, 20) === 3, "narrow width still keeps three columns");
assert(masonryColumnCount(390, 20, 100) === 3, "mobile min width still keeps three columns");
assert(minColumnWidthFor(390) === 100, "narrow viewports use a smaller min column width");
assert(minColumnWidthFor(1200) === 150, "wide viewports use the 150px min column width");

assert(shortestColumnIndex([4, 1.2, 3]) === 1, "picks the currently shortest column");
assert(shortestColumnIndex([2, 2, 1.9]) === 2, "picks the last column when it is shortest");

const sequentialTrap = distributeMasonry(
  [
    { src: "tall", ratio: 3 },
    { src: "a", ratio: 0.2 },
    { src: "b", ratio: 0.2 },
  ],
  2,
);
assert(sequentialTrap[0].map((item) => item.src).join() === "tall", "tall image stays alone");
assert(
  sequentialTrap[1].map((item) => item.src).join() === "a,b",
  "short images stack on the shorter column instead of filling in order",
);

const many = Array.from({ length: 20 }, (_, index) => ({
  src: String(index),
  ratio: 1.4,
}));
const fewColumns = distributeMasonry(many, 3);
const manyColumns = distributeMasonry(many, 8);
const height = (columns: { ratio: number }[][]) =>
  Math.max(...columns.map((col) => col.reduce((sum, item) => sum + item.ratio, 0)));
assert(
  height(manyColumns) < height(fewColumns),
  "more columns reduce the tallest stack for many images",
);

console.log("masonry tests passed");
