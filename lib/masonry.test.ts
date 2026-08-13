import {
  distributeMasonry,
  masonryColumnCount,
  shortestColumnIndex,
} from "./masonry";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(masonryColumnCount(939, 15) === 4, "wide container with many images uses width-based count");
assert(masonryColumnCount(939, 1) === 3, "one image still keeps three columns");
assert(masonryColumnCount(1200, 6) === 3, "fewer than 10 images prefer three balanced columns");
assert(masonryColumnCount(1200, 8) === 4, "eight images can use up to four columns");
assert(masonryColumnCount(390, 15) === 3, "narrow containers still keep three columns");

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

const tall = { src: "a", ratio: 2 };
const square = { src: "b", ratio: 1 };
const wide = { src: "c", ratio: 0.5 };
const extra = { src: "d", ratio: 1.2 };
const columns = distributeMasonry([tall, square, wide, extra], 2, 0.05);
const heights = columns.map((col) =>
  col.reduce((sum, item) => sum + item.ratio, 0),
);
assert(columns[0].length + columns[1].length === 4, "all images are placed");
assert(Math.abs(heights[0] - heights[1]) < 1.5, "column heights stay close");

console.log("masonry tests passed");
