import { readFileSync } from "node:fs";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const WIDTH = 1080;

function loadEnvLocal() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

async function stitchLongImage() {
  const parts = [
    "public/placeholders/detail-page-part-1.png",
    "public/placeholders/detail-page-part-2.png",
    "public/placeholders/detail-page-part-3.png",
  ];
  const resized = [];
  for (const part of parts) {
    const buffer = await sharp(part).resize({ width: WIDTH }).jpeg({ quality: 88 }).toBuffer();
    const meta = await sharp(buffer).metadata();
    resized.push({ buffer, height: meta.height ?? 0 });
  }
  const height = resized.reduce((sum, part) => sum + part.height, 0);
  let top = 0;
  const composites = resized.map((part) => {
    const item = { input: part.buffer, top, left: 0 };
    top += part.height;
    return item;
  });
  await sharp({
    create: {
      width: WIDTH,
      height,
      channels: 3,
      background: { r: 250, g: 250, b: 250 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile("public/placeholders/detail-page-long.jpg");
  console.log(`stitched long image ${WIDTH}x${height}`);
}

async function updateProjects() {
  loadEnvLocal();
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service role");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const longImage = "/placeholders/detail-page-long.jpg";
  const perfume = [
    "/placeholders/packaging-perfume-1.png",
    "/placeholders/packaging-perfume-2.png",
    "/placeholders/packaging-perfume-3.png",
    "/placeholders/packaging-perfume-4.png",
  ];

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, category")
    .like("title", "%(임시)%");
  if (error) throw new Error(error.message);

  for (const project of projects ?? []) {
    if (project.category === "packaging") {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          thumbnail_url: longImage,
          images: [longImage],
        })
        .eq("id", project.id);
      if (updateError) throw new Error(updateError.message);
      console.log(`updated detail page project ${project.id}`);
    }
    if (project.category === "detail_page") {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          thumbnail_url: perfume[0],
          images: perfume,
        })
        .eq("id", project.id);
      if (updateError) throw new Error(updateError.message);
      console.log(`updated packaging project ${project.id}`);
    }
  }
}

await stitchLongImage();
await updateProjects();
console.log("placeholder assets ready");
