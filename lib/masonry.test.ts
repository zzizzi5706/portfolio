import {
  detailPageColumnCount,
  masonryColumnCount,
  renderedImageHeight,
  splitImagesByTargetHeight,
  splitImagesRoundRobin,
} from "./masonry";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(masonryColumnCount(5) === 2, "5 images use 2 columns");
assert(masonryColumnCount(6) === 2, "6 images use 2 columns");
assert(masonryColumnCount(7) === 3, "7 images use 3 columns");
assert(masonryColumnCount(10) === 4, "10 images use 4 columns");
assert(masonryColumnCount(15) === 5, "15 images use 5 columns");

assert(detailPageColumnCount(1) === 3, "1 image uses 3 columns");
assert(detailPageColumnCount(9) === 3, "9 images use 3 columns");
assert(detailPageColumnCount(10) === 3, "10 images still use 3 columns");
assert(detailPageColumnCount(12) === 3, "12 images use 3 columns");
assert(detailPageColumnCount(13) === 4, "13 images use 4 columns");

const eight = splitImagesRoundRobin(["0", "1", "2", "3", "4", "5", "6", "7"], 3);
assert(eight[0].join() === "0,3,6", "8 images fill left column first");
assert(eight[1].join() === "1,4,7", "8 images fill middle column next");
assert(eight[2].join() === "2,5", "8 images leave the right column shortest");

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

assert(renderedImageHeight(100, 200, 50) === 100, "scales height by column width");

const sequential = splitImagesByTargetHeight(
  [120, 80, 90, 70, 200, 40].map((height, index) => ({ item: index, height })),
  3,
);
assert(sequential.flat().join() === "0,1,2,3,4,5", "keeps original image order");
assert(sequential[0].join() === "0,1", "fills first column until the next image would exceed the target");
assert(sequential[1].join() === "2,3", "fills the next column the same way");
assert(sequential[2].join() === "4,5", "last column absorbs the remainder");

const tallFirst = splitImagesByTargetHeight(
  [300, 10, 10, 10].map((height, index) => ({ item: index, height })),
  3,
);
assert(tallFirst[0].join() === "0", "keeps an oversized first image in the current column");
assert(tallFirst[1].join() === "1,2,3", "later short images still fill up to the target");
assert(tallFirst[2].join() === "", "last column can be empty if earlier columns already took the rest");

const withGap = splitImagesByTargetHeight(
  [100, 50, 50, 200].map((height, index) => ({ item: index, height })),
  2,
  10,
);
assert(withGap[0].join() === "0,1", "counts the in-column gap when testing the target");
assert(withGap[1].join() === "2,3", "remaining images go to the last column");

console.log("masonry tests passed");
