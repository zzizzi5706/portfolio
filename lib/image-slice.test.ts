import { findGapCenters, selectCutYs, SLICE_CONFIG } from "./image-slice";

function makeRows(rows: Array<{ blank: boolean; count: number }>) {
  const width = 20;
  const height = rows.reduce((sum, row) => sum + row.count, 0);
  const data = new Uint8ClampedArray(width * height * 4);
  let y = 0;
  for (const row of rows) {
    for (let i = 0; i < row.count; i += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = ((y + i) * width + x) * 4;
        if (row.blank) {
          data[index] = 250;
          data[index + 1] = 250;
          data[index + 2] = 250;
          data[index + 3] = 255;
        } else {
          data[index] = x % 2 === 0 ? 30 : 200;
          data[index + 1] = 40;
          data[index + 2] = 50;
          data[index + 3] = 255;
        }
      }
    }
    y += row.count;
  }
  return { data, width, height };
}

const sample = makeRows([
  { blank: false, count: 500 },
  { blank: true, count: 40 },
  { blank: false, count: 1200 },
  { blank: true, count: 50 },
  { blank: false, count: 1800 },
]);

const centers = findGapCenters(sample.data, sample.width, sample.height);
const cuts = selectCutYs(sample.height, centers);

if (centers.length < 2) {
  throw new Error(`expected gap centers, got ${centers.join(",")}`);
}
if (cuts.length === 0) {
  throw new Error("expected at least one cut from white gaps");
}
for (let i = 0; i < cuts.length; i += 1) {
  const start = i === 0 ? 0 : cuts[i - 1];
  const size = cuts[i] - start;
  if (size < SLICE_CONFIG.MIN_SLICE_HEIGHT || size > SLICE_CONFIG.MAX_SLICE_HEIGHT) {
    throw new Error(`cut size ${size} out of range`);
  }
}

const noGap = makeRows([{ blank: false, count: 6200 }]);
const fallbackCuts = selectCutYs(
  noGap.height,
  findGapCenters(noGap.data, noGap.width, noGap.height),
);
if (fallbackCuts.length < 3) {
  throw new Error(`expected fallback cuts, got ${fallbackCuts.join(",")}`);
}

console.log("image-slice algorithm ok", { centers, cuts, fallbackCuts });
