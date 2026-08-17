import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const YEAR = String(new Date().getFullYear());
const BUCKET = "portfolio-images";
const IMAGE_COUNT = 5;

const CATEGORIES = [
  {
    key: "packaging",
    label: "상세페이지",
    queries: ["product landing page", "ecommerce banner design"],
  },
  {
    key: "web",
    label: "웹디자인",
    queries: ["website design mockup", "ui design screen"],
  },
  {
    key: "detail_page",
    label: "패키징",
    queries: ["cosmetic packaging", "product bottle design"],
  },
];

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

function supabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/$/, "");
}

async function searchPexels(apiKey, query, perPage) {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));

  const response = await fetch(url, {
    headers: { Authorization: apiKey },
  });
  if (!response.ok) {
    throw new Error(`Pexels search failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return (data.photos ?? []).flatMap((photo) => {
    const src = photo.src?.large2x || photo.src?.large || photo.src?.original;
    if (!src) return [];
    return [{ id: photo.id, src, alt: photo.alt ?? query }];
  });
}

async function collectPhotos(apiKey, queries, needed) {
  const found = [];
  const seen = new Set();

  for (const query of queries) {
    if (found.length >= needed) break;
    const photos = await searchPexels(apiKey, query, 8);
    for (const photo of photos) {
      if (seen.has(photo.id)) continue;
      seen.add(photo.id);
      found.push(photo);
      if (found.length >= needed) break;
    }
  }

  if (found.length < 4) {
    throw new Error(`Not enough Pexels photos for ${queries.join(", ")} (got ${found.length})`);
  }
  return found.slice(0, needed);
}

async function downloadImage(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "portfolio-placeholder-seed/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Image download failed (${response.status}) for ${url}`);
  }
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  return { buffer, contentType, ext };
}

async function createAuthedClient() {
  const url = supabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = process.env.SUPABASE_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.SUPABASE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (email && password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Supabase login failed: ${error.message}`);
    return client;
  }

  const { error: anonymousError } = await client.auth.signInAnonymously();
  if (anonymousError) {
    throw new Error(
      "Supabase writes need auth. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ADMIN_EMAIL/PASSWORD to .env.local. " +
        `Anonymous sign-in failed: ${anonymousError.message}`,
    );
  }

  return client;
}

async function uploadImage(supabase, folder, file) {
  const path = `${folder}/${Date.now()}-${randomUUID()}.${file.ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.contentType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: publicData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data?.path ?? path);
  if (!publicData?.publicUrl) {
    throw new Error("Could not build public URL for uploaded image");
  }
  return publicData.publicUrl;
}

async function nextDisplayOrder(supabase) {
  const { data, error } = await supabase
    .from("projects")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to read display_order: ${error.message}`);
  return (data?.display_order ?? 0) + 1;
}

async function seedCategory(supabase, pexelsKey, category, displayOrder) {
  const title = `${category.label} 샘플 프로젝트 (임시)`;
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("id, title, category")
    .eq("title", title)
    .maybeSingle();
  if (existingError) {
    throw new Error(`Failed to check existing project: ${existingError.message}`);
  }
  if (existing) {
    console.log(`Skip existing: ${title} (${existing.category})`);
    return { title: existing.title, category: existing.category, skipped: true };
  }

  const photos = await collectPhotos(pexelsKey, category.queries, IMAGE_COUNT);
  const urls = [];
  for (const [index, photo] of photos.entries()) {
    const file = await downloadImage(photo.src);
    const url = await uploadImage(
      supabase,
      `projects/placeholders/${category.key}`,
      file,
    );
    urls.push(url);
    console.log(`  uploaded ${index + 1}/${photos.length} for ${category.label}`);
  }

  const payload = {
    title,
    category: category.key,
    description: "임시 샘플 데이터입니다.",
    brand: "Sample Brand",
    participation: "임시 샘플 데이터",
    project_year: YEAR,
    thumbnail_url: urls[0],
    images: urls.slice(1),
    display_order: displayOrder,
  };

  const { error } = await supabase.from("projects").insert(payload);
  if (error) throw new Error(`Insert failed for ${title}: ${error.message}`);

  console.log(`Created: ${title} [${category.key}]`);
  return { title, category: category.key, skipped: false };
}

async function main() {
  loadEnvLocal();

  const pexelsKey = process.env.PEXELS_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!pexelsKey && !unsplashKey) {
    throw new Error("Neither PEXELS_API_KEY nor UNSPLASH_ACCESS_KEY is set");
  }
  if (!pexelsKey) {
    throw new Error("Pexels is the available API in this env; PEXELS_API_KEY is missing");
  }

  const supabase = await createAuthedClient();
  let displayOrder = await nextDisplayOrder(supabase);
  const created = [];

  for (const category of CATEGORIES) {
    const result = await seedCategory(supabase, pexelsKey, category, displayOrder);
    created.push(result);
    if (!result.skipped) displayOrder += 1;
  }

  console.log("\nDone.");
  console.log(JSON.stringify({ imageApi: "Pexels", projects: created }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
