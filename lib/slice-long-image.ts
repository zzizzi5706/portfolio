import {
  SLICE_CONFIG,
  findGaps,
  groupShortSlices,
  sliceContentRanges,
  trimBlankEdges,
} from "@/lib/image-slice";

export type ImageFileWithSize = {
  file: File;
  width: number;
  height: number;
};

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽지 못했습니다."));
    };
    image.src = url;
  });
}

function canvasToFile(canvas: HTMLCanvasElement, name: string) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지 조각을 만들지 못했습니다."));
          return;
        }
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  });
}

export async function sliceLongImage(file: File) {
  const image = await loadImage(file);
  const scale = Math.min(1, SLICE_CONFIG.ANALYSIS_MAX_WIDTH / image.width);
  const analysisWidth = Math.max(1, Math.round(image.width * scale));
  const analysisHeight = Math.max(1, Math.round(image.height * scale));

  const analysis = document.createElement("canvas");
  analysis.width = analysisWidth;
  analysis.height = analysisHeight;
  const analysisCtx = analysis.getContext("2d", { willReadFrequently: true });
  if (!analysisCtx) throw new Error("캔버스를 사용할 수 없습니다.");
  analysisCtx.drawImage(image, 0, 0, analysisWidth, analysisHeight);
  const { data } = analysisCtx.getImageData(0, 0, analysisWidth, analysisHeight);

  const analysisGaps = findGaps(data, analysisWidth, analysisHeight, {
    ...SLICE_CONFIG,
    MIN_GAP_HEIGHT: Math.max(8, Math.round(SLICE_CONFIG.MIN_GAP_HEIGHT * scale)),
  });
  const analysisRanges = sliceContentRanges(analysisHeight, analysisGaps, {
    ...SLICE_CONFIG,
    MAX_SLICE_HEIGHT: Math.max(1, Math.round(SLICE_CONFIG.MAX_SLICE_HEIGHT * scale)),
    FALLBACK_SLICE_HEIGHT: Math.max(1, Math.round(SLICE_CONFIG.FALLBACK_SLICE_HEIGHT * scale)),
  })
    .map((range) => trimBlankEdges(data, analysisWidth, analysisHeight, range))
    .filter((range): range is NonNullable<typeof range> => range !== null);
  const groups = groupShortSlices(
    analysisRanges.map((range) => ({
      start: Math.round(range.start / scale),
      end: Math.round(range.end / scale),
    })),
    SLICE_CONFIG.MIN_SLICE_HEIGHT,
  );

  const files: ImageFileWithSize[] = [];
  for (const [index, group] of groups.entries()) {
    const height = group.reduce((sum, range) => sum + (range.end - range.start), 0);
    if (height < 1) continue;
    const slice = document.createElement("canvas");
    slice.width = image.width;
    slice.height = height;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("캔버스를 사용할 수 없습니다.");
    let y = 0;
    for (const range of group) {
      const piece = range.end - range.start;
      ctx.drawImage(
        image,
        0,
        range.start,
        image.width,
        piece,
        0,
        y,
        image.width,
        piece,
      );
      y += piece;
    }
    files.push({
      file: await canvasToFile(
        slice,
        `${file.name.replace(/\.[^.]+$/, "")}-${index + 1}.jpg`,
      ),
      width: slice.width,
      height: slice.height,
    });
  }

  return files;
}

export async function mergeImageFiles(first: File, second: File) {
  const top = await loadImage(first);
  const bottom = await loadImage(second);
  const width = Math.max(top.width, bottom.width);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = top.height + bottom.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("캔버스를 사용할 수 없습니다.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(top, 0, 0);
  ctx.drawImage(bottom, 0, top.height);
  return {
    file: await canvasToFile(
      canvas,
      first.name.replace(/-\d+\.jpg$/, "") + "-merged.jpg",
    ),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function fileImageSize(file: File) {
  const image = await loadImage(file);
  return {
    width: Math.max(1, image.naturalWidth || image.width),
    height: Math.max(1, image.naturalHeight || image.height),
  };
}
