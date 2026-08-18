export const SLICE_CONFIG = {
  WHITE_THRESHOLD: 240,
  VARIANCE_THRESHOLD: 18,
  SAMPLE_STEP: 5,
  MIN_GAP_HEIGHT: 30,
  MIN_SLICE_HEIGHT: 400,
  MAX_SLICE_HEIGHT: 2000,
  FALLBACK_SLICE_HEIGHT: 1500,
  FALLBACK_MIN_IMAGE_HEIGHT: 5000,
  ANALYSIS_MAX_WIDTH: 480,
} as const;

export type ImageGap = {
  start: number;
  end: number;
  center: number;
};

export type ImageRange = {
  start: number;
  end: number;
};

export function isBlankRow(
  data: Uint8ClampedArray,
  width: number,
  y: number,
  config = SLICE_CONFIG,
) {
  let minLuma = 255;
  let maxLuma = 0;
  let samples = 0;

  for (let x = 0; x < width; x += config.SAMPLE_STEP) {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (
      r < config.WHITE_THRESHOLD ||
      g < config.WHITE_THRESHOLD ||
      b < config.WHITE_THRESHOLD
    ) {
      return false;
    }
    const luma = (r + g + b) / 3;
    if (luma < minLuma) minLuma = luma;
    if (luma > maxLuma) maxLuma = luma;
    samples += 1;
  }

  return samples > 0 && maxLuma - minLuma <= config.VARIANCE_THRESHOLD;
}

export function isMostlyBlankRow(
  data: Uint8ClampedArray,
  width: number,
  y: number,
  config = SLICE_CONFIG,
) {
  let blank = 0;
  let samples = 0;

  for (let x = 0; x < width; x += config.SAMPLE_STEP) {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    samples += 1;
    if (
      r >= config.WHITE_THRESHOLD &&
      g >= config.WHITE_THRESHOLD &&
      b >= config.WHITE_THRESHOLD
    ) {
      blank += 1;
    }
  }

  return samples > 0 && blank / samples >= 0.97;
}

export function findGaps(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  config = SLICE_CONFIG,
): ImageGap[] {
  const gaps: ImageGap[] = [];
  let gapStart = -1;

  for (let y = 0; y < height; y += 1) {
    const blank = isMostlyBlankRow(data, width, y, config);
    if (blank && gapStart === -1) gapStart = y;
    if ((!blank || y === height - 1) && gapStart !== -1) {
      const gapEnd = blank && y === height - 1 ? y + 1 : y;
      if (gapEnd - gapStart >= config.MIN_GAP_HEIGHT) {
        gaps.push({
          start: gapStart,
          end: gapEnd,
          center: Math.round((gapStart + gapEnd) / 2),
        });
      }
      gapStart = -1;
    }
  }

  return gaps;
}

export function findGapCenters(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  config = SLICE_CONFIG,
) {
  return findGaps(data, width, height, config).map((gap) => gap.center);
}

export function selectCutGaps(
  height: number,
  gaps: ImageGap[],
  config = SLICE_CONFIG,
) {
  const cuts: ImageGap[] = [];
  let last = 0;
  const usable = [...gaps].sort((a, b) => a.center - b.center);
  const pointGap = (y: number): ImageGap => ({ start: y, end: y, center: y });

  const forceEvery = (from: number) => {
    let cursor = from;
    while (height - cursor > config.MAX_SLICE_HEIGHT) {
      cursor += config.FALLBACK_SLICE_HEIGHT;
      if (cursor >= height) break;
      cuts.push(pointGap(cursor));
    }
  };

  if (usable.length === 0 && height >= config.FALLBACK_MIN_IMAGE_HEIGHT) {
    forceEvery(0);
    return cuts;
  }

  while (height - last > config.MAX_SLICE_HEIGHT) {
    const minEnd = last + config.MIN_SLICE_HEIGHT;
    const maxEnd = last + config.MAX_SLICE_HEIGHT;
    const inRange = usable.filter(
      (gap) => gap.center >= minEnd && gap.center <= maxEnd && gap.center > last,
    );

    if (inRange.length > 0) {
      const cut = inRange[inRange.length - 1];
      cuts.push(cut);
      last = cut.center;
      continue;
    }

    const forced = Math.min(last + config.FALLBACK_SLICE_HEIGHT, height);
    if (forced >= height || forced - last < config.MIN_SLICE_HEIGHT) break;
    cuts.push(pointGap(forced));
    last = forced;
  }

  return cuts;
}

export function selectCutYs(
  height: number,
  gapCenters: number[],
  config = SLICE_CONFIG,
) {
  return selectCutGaps(
    height,
    gapCenters.map((center) => ({ start: center, end: center, center })),
    config,
  ).map((gap) => gap.center);
}

export function cutsToRanges(height: number, cuts: number[]) {
  const points = [0, ...cuts.filter((y) => y > 0 && y < height), height];
  const ranges: ImageRange[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    if (points[i + 1] > points[i]) {
      ranges.push({ start: points[i], end: points[i + 1] });
    }
  }
  return ranges;
}

export function gapsToContentRanges(height: number, cutGaps: ImageGap[]) {
  const ranges: ImageRange[] = [];
  let last = 0;
  const sorted = [...cutGaps].sort((a, b) => a.center - b.center);

  for (const gap of sorted) {
    const end = Math.min(Math.max(gap.start, last), height);
    if (end > last) ranges.push({ start: last, end });
    last = Math.max(last, Math.min(gap.end, height));
  }

  if (height > last) ranges.push({ start: last, end: height });
  return ranges;
}

export function splitOversizedRanges(
  ranges: ImageRange[],
  config = SLICE_CONFIG,
) {
  const out: ImageRange[] = [];
  for (const range of ranges) {
    let start = range.start;
    while (range.end - start > config.MAX_SLICE_HEIGHT) {
      const end = start + config.FALLBACK_SLICE_HEIGHT;
      out.push({ start, end });
      start = end;
    }
    if (range.end > start) out.push({ start, end: range.end });
  }
  return out;
}

export function sliceContentRanges(
  height: number,
  gaps: ImageGap[],
  config = SLICE_CONFIG,
) {
  return splitOversizedRanges(gapsToContentRanges(height, gaps), config);
}

export function groupShortSlices(
  ranges: ImageRange[],
  minHeight = SLICE_CONFIG.MIN_SLICE_HEIGHT,
) {
  const groups: ImageRange[][] = [];
  for (const range of ranges) {
    const last = groups[groups.length - 1];
    if (last && range.end - range.start < minHeight) {
      last.push(range);
      continue;
    }
    groups.push([range]);
  }
  return groups;
}

export function trimBlankEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  range: ImageRange,
  config = SLICE_CONFIG,
): ImageRange | null {
  const from = Math.max(0, range.start);
  const to = Math.min(height, range.end);
  const minRun = 8;
  const isContent = (y: number) => !isMostlyBlankRow(data, width, y, config);

  let start = from;
  let run = 0;
  let mark = from;
  for (let y = from; y < to; y += 1) {
    if (isContent(y)) {
      if (run === 0) mark = y;
      run += 1;
      if (run >= minRun) {
        start = mark;
        break;
      }
    } else {
      run = 0;
    }
  }

  let end = to;
  run = 0;
  mark = to;
  for (let y = to - 1; y >= start; y -= 1) {
    if (isContent(y)) {
      if (run === 0) mark = y + 1;
      run += 1;
      if (run >= minRun) {
        end = mark;
        break;
      }
    } else {
      run = 0;
    }
  }

  if (end - start < 1) return null;
  return { start, end };
}
