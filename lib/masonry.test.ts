import { masonryColumnCount, splitImagesRoundRobin } from "./masonry";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(masonryColumnCount(5) === 2, "5 images use 2 columns");
assert(masonryColumnCount(6) === 2, "6 images use 2 columns");
assert(masonryColumnCount(7) === 3, "7 images use 3 columns");
assert(masonryColumnCount(10) === 4, "10 images use 4 columns");
assert(masonryColumnCount(15) === 5, "15 images use 5 columns");

const five = splitImagesRoundRobin(["a", "b", "c", "d", "e"], 2);
assert(five[0].join() === "a,c,e", "round-robin fills column 0 in order");
assert(five[1].join() === "b,d", "round-robin fills column 1 in order");

const ten = splitImagesRoundRobin(Array.from({ length: 10 }, (_, i) => i), 4);
assert(
  ten.every((column) => column.length === 2 || column.length === 3),
  "10 images split evenly across 4 columns",
);
assert(ten.flat().join() !== "0,1,2,3,4,5,6,7,8,9" || ten[0][0] === 0, "keeps original order");
assert(ten[0][0] === 0 && ten[1][0] === 1 && ten[2][0] === 2 && ten[3][0] === 3, "starts in order");

const fifteen = splitImagesRoundRobin(Array.from({ length: 15 }, (_, i) => i), 5);
assert(
  fifteen.every((column) => column.length === 3),
  "15 images split into 3 per column",
);

console.log("masonry tests passed");
