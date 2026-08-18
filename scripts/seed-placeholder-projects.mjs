import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const YEAR = String(new Date().getFullYear());
const BUCKET = "portfolio-images";
const TARGET_PER_CATEGORY = 5;

const CATEGORIES = [
  {
    key: "packaging",
    label: "상세페이지",
    queries: [
      "product landing page",
      "ecommerce banner design",
      "product detail page design",
    ],
  },
  {
    key: "web",
    label: "웹디자인",
    queries: [
      "website design mockup",
      "ui design screen",
      "landing page design",
      "app interface design",
    ],
  },
  {
    key: "detail_page",
    label: "패키징",
    queries: [
      "cosmetic packaging",
      "perfume bottle",
      "skincare product box",
      "beauty product design",
    ],
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

function imageCountFor(index) {
  return 4 + (index % 3);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nextSampleNumber(titles, label) {
  let max = 0;
  if (titles.has(`${label} 샘플 프로젝트 (임시)`)) max = 1;
  const pattern = new RegExp(`^${escapeRegex(label)} 샘플 프로젝트 (\\d+) \\(임시\\)$`);
  for (const title of titles) {
    const match = title.match(pattern);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

function sampleTitle(label, number) {
  return `${label} 샘플 프로젝트 ${number} (임시)`;
}

async function searchPexels(apiKey, query, perPage, page) {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));

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
    return [{ id: `pexels-${photo.id}`, src, alt: photo.alt ?? query }];
  });
}

async function searchUnsplash(apiKey, query, perPage, page) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${apiKey}`,
      "Accept-Version": "v1",
    },
  });
  if (!response.ok) {
    throw new Error(`Unsplash search failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return (data.results ?? []).flatMap((photo) => {
    const src = photo.urls?.regular || photo.urls?.full || photo.urls?.small;
    if (!src) return [];
    return [
      {
        id: `unsplash-${photo.id}`,
        src,
        alt: photo.alt_description ?? query,
      },
    ];
  });
}

function createPhotoSearchers() {
  const pexelsKey = process.env.PEXELS_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const searchers = [];

  if (pexelsKey) {
    searchers.push({
      name: "Pexels",
      search: (query, perPage, page) => searchPexels(pexelsKey, query, perPage, page),
    });
  }
  if (unsplashKey) {
    searchers.push({
      name: "Unsplash",
      search: (query, perPage, page) => searchUnsplash(unsplashKey, query, perPage, page),
    });
  }
  if (searchers.length === 0) {
    throw new Error("Neither PEXELS_API_KEY nor UNSPLASH_ACCESS_KEY is set");
  }
  return searchers;
}

async function collectPhotos(searchers, queries, needed, seen, startPage) {
  const found = [];

  for (const searcher of searchers) {
    for (let page = startPage; page < startPage + 3; page += 1) {
      for (const query of queries) {
        if (found.length >= needed) break;
        const photos = await searcher.search(query, 10, page);
        for (const photo of photos) {
          if (seen.has(photo.id)) continue;
          seen.add(photo.id);
          found.push(photo);
          if (found.length >= needed) break;
        }
      }
      if (found.length >= needed) break;
    }
    if (found.length >= needed) break;
  }

  if (found.length < 4) {
    throw new Error(`Not enough photos for ${queries.join(", ")} (got ${found.length})`);
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

async function existingPlaceholderTitles(supabase, categoryKey) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, category")
    .eq("category", categoryKey);
  if (error) throw new Error(`Failed to list ${categoryKey} projects: ${error.message}`);

  const titles = new Set(
    (data ?? [])
      .map((project) => project.title ?? "")
      .filter((title) => title.includes("(임시)")),
  );
  return {
    total: data?.length ?? 0,
    placeholderCount: titles.size,
    titles,
  };
}

async function createPlaceholder(supabase, searchers, seen, category, title, displayOrder, imageCount, queryOffset) {
  const rotatedQueries = [
    ...category.queries.slice(queryOffset % category.queries.length),
    ...category.queries.slice(0, queryOffset % category.queries.length),
  ];
  const photos = await collectPhotos(
    searchers,
    rotatedQueries,
    imageCount,
    seen,
    1 + queryOffset,
  );
  const urls = [];
  for (const [index, photo] of photos.entries()) {
    const file = await downloadImage(photo.src);
    const url = await uploadImage(
      supabase,
      `projects/placeholders/${category.key}`,
      file,
    );
    urls.push(url);
    console.log(`  uploaded ${index + 1}/${photos.length} for ${title}`);
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
}

async function main() {
  loadEnvLocal();
  const searchers = createPhotoSearchers();
  const supabase = await createAuthedClient();
  let displayOrder = await nextDisplayOrder(supabase);
  const seen = new Set();
  const summary = [];

  for (const category of CATEGORIES) {
    const existing = await existingPlaceholderTitles(supabase, category.key);
    const missing = Math.max(0, TARGET_PER_CATEGORY - existing.placeholderCount);
    console.log(
      `\n${category.label} [${category.key}]: ${existing.placeholderCount} placeholder(s), need ${missing} more`,
    );

    let created = 0;
    let sampleNumber = nextSampleNumber(existing.titles, category.label);
    for (let i = 0; i < missing; i += 1) {
      while (existing.titles.has(sampleTitle(category.label, sampleNumber))) {
        sampleNumber += 1;
      }
      const title = sampleTitle(category.label, sampleNumber);
      existing.titles.add(title);
      await createPlaceholder(
        supabase,
        searchers,
        seen,
        category,
        title,
        displayOrder,
        imageCountFor(sampleNumber),
        sampleNumber,
      );
      displayOrder += 1;
      sampleNumber += 1;
      created += 1;
    }

    summary.push({
      label: category.label,
      key: category.key,
      created,
      placeholders: existing.placeholderCount + created,
    });
  }

  console.log("\nDone.");
  console.log(
    JSON.stringify(
      {
        imageApis: searchers.map((searcher) => searcher.name),
        categories: summary,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
