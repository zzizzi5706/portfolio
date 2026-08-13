import { distributeMasonry, masonryColumnCount } from "./masonry";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(masonryColumnCount(939, 8) === 4, "900px+ container should get ~4 columns");
assert(masonryColumnCount(939, 1) === 1, "one image should use one column");
assert(masonryColumnCount(939, 3) === 2, "three images should pack into two columns");
assert(masonryColumnCount(390, 8) === 1, "narrow container stays at one column");

const tall = { src: "a", ratio: 2 };
const square = { src: "b", ratio: 1 };
const wide = { src: "c", ratio: 0.5 };
const extra = { src: "d", ratio: 1.2 };

const columns = distributeMasonry([tall, square, wide, extra], 2);
const heights = columns.map((col) => col.reduce((sum, item) => sum + item.ratio, 0));
assert(columns[0].length + columns[1].length === 4, "all images are placed");
assert(Math.abs(heights[0] - heights[1]) < 1.5, "column heights stay close");

console.log("masonry tests passed");
