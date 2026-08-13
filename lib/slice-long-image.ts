import {
  SLICE_CONFIG,
  cutsToRanges,
  findGapCenters,
  selectCutYs,
} from "@/lib/image-slice";

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

  const gapCenters = findGapCenters(data, analysisWidth, analysisHeight).map((y) =>
    Math.round(y / scale),
  );
  const cuts = selectCutYs(image.height, gapCenters);
  const ranges = cutsToRanges(image.height, cuts);

  const files: File[] = [];
  for (const [index, range] of ranges.entries()) {
    const height = range.end - range.start;
    const slice = document.createElement("canvas");
    slice.width = image.width;
    slice.height = height;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("캔버스를 사용할 수 없습니다.");
    ctx.drawImage(
      image,
      0,
      range.start,
      image.width,
      height,
      0,
      0,
      image.width,
      height,
    );
    files.push(
      await canvasToFile(slice, `${file.name.replace(/\.[^.]+$/, "")}-${index + 1}.jpg`),
    );
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
  return canvasToFile(canvas, first.name.replace(/-\d+\.jpg$/, "") + "-merged.jpg");
}
