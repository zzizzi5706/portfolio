import {
  findGapCenters,
  findGaps,
  gapsToContentRanges,
  groupShortSlices,
  selectCutYs,
  sliceContentRanges,
  SLICE_CONFIG,
  trimBlankEdges,
} from "./image-slice";

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

const gapSample = makeRows([
  { blank: false, count: 500 },
  { blank: true, count: 40 },
  { blank: false, count: 1200 },
]);
const gaps = findGaps(gapSample.data, gapSample.width, gapSample.height);
if (gaps.length !== 1) throw new Error(`expected 1 gap, got ${gaps.length}`);
if (gaps[0].start !== 500 || gaps[0].end !== 540) {
  throw new Error(`gap should be 500-540, got ${gaps[0].start}-${gaps[0].end}`);
}
const content = gapsToContentRanges(gapSample.height, gaps);
if (content[0].end !== 500) throw new Error("first slice must stop before the gap");
if (content[1].start !== 540) throw new Error("second slice must start after the gap");

const padded = makeRows([
  { blank: true, count: 20 },
  { blank: false, count: 80 },
  { blank: true, count: 20 },
]);
const trimmed = trimBlankEdges(padded.data, padded.width, padded.height, {
  start: 0,
  end: padded.height,
});
if (!trimmed || trimmed.start !== 20 || trimmed.end !== 100) {
  throw new Error(`trimBlankEdges failed: ${JSON.stringify(trimmed)}`);
}

const noisy = makeRows([
  { blank: false, count: 2 },
  { blank: true, count: 40 },
  { blank: false, count: 80 },
]);
const noisyTrim = trimBlankEdges(noisy.data, noisy.width, noisy.height, {
  start: 0,
  end: noisy.height,
});
if (!noisyTrim || noisyTrim.start !== 42) {
  throw new Error(`should skip thin leading content, got ${JSON.stringify(noisyTrim)}`);
}

const shortSections = makeRows([
  { blank: false, count: 180 },
  { blank: true, count: 40 },
  { blank: false, count: 220 },
  { blank: true, count: 50 },
  { blank: false, count: 160 },
]);
const allGapRanges = sliceContentRanges(
  shortSections.height,
  findGaps(shortSections.data, shortSections.width, shortSections.height),
);
if (allGapRanges.length !== 3) {
  throw new Error(`expected a slice per section, got ${allGapRanges.length}`);
}
if (allGapRanges[0].end !== 180 || allGapRanges[1].start !== 220) {
  throw new Error(`all-gap slices should exclude whitespace: ${JSON.stringify(allGapRanges)}`);
}

const grouped = groupShortSlices(allGapRanges, 400);
if (grouped.length !== 1 || grouped[0].length !== 3) {
  throw new Error(`short slices should merge into previous: ${JSON.stringify(grouped)}`);
}

console.log("image-slice gap trim ok");
