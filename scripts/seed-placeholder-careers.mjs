import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const DISCLAIMER = "(예시 데이터 - 추후 실제 경력으로 교체 예정)";

const CAREERS = [
  {
    year_range: "2024.03 — 현재",
    company: "루미네 코스메틱",
    role: "패키징 디자이너",
    employment_type: "regular",
    description: `스킨케어 라인의 용기·외함 패키징을 담당하며, 브랜드 리뉴얼에 맞춰 촉감과 실루엣을 정리했습니다. ${DISCLAIMER}`,
    display_order: 0,
  },
  {
    year_range: "2022.04 — 2024.02",
    company: "하프톤 디자인 스튜디오",
    role: "웹·상세페이지 디자이너",
    employment_type: "contract",
    description: `화장품 브랜드 웹사이트와 제품 상세페이지를 제작하고, 시즌 캠페인 랜딩 구성을 맡았습니다. ${DISCLAIMER}`,
    display_order: 1,
  },
  {
    year_range: "2020.09 — 2022.03",
    company: "스튜디오 결",
    role: "패키징·상세페이지 디자이너",
    employment_type: "freelancer",
    description: `소규모 뷰티 브랜드의 패키징과 상세페이지를 프로젝트 단위로 진행했습니다. ${DISCLAIMER}`,
    display_order: 2,
  },
  {
    year_range: "2018.03 — 2020.08",
    company: "아틀리에 문라이트",
    role: "주니어 그래픽 디자이너",
    employment_type: "regular",
    description: `뷰티 편집 디자인과 웹 배너, 상세페이지 시안 작업을 담당하며 패키징 기초를 익혔습니다. ${DISCLAIMER}`,
    display_order: 3,
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
  }

  return client;
}

async function main() {
  loadEnvLocal();
  const supabase = await createAuthedClient();
  const created = [];

  for (const career of CAREERS) {
    const { data: existing, error: existingError } = await supabase
      .from("careers")
      .select("id, company, role, year_range")
      .eq("company", career.company)
      .eq("year_range", career.year_range)
      .maybeSingle();
    if (existingError) {
      throw new Error(`Failed to check existing career: ${existingError.message}`);
    }
    if (existing) {
      console.log(`Skip existing: ${career.company} (${career.year_range})`);
      created.push({ ...career, skipped: true });
      continue;
    }

    const { error } = await supabase.from("careers").insert(career);
    if (error) throw new Error(`Insert failed for ${career.company}: ${error.message}`);
    console.log(`Created: ${career.company} / ${career.role} / ${career.year_range}`);
    created.push({ ...career, skipped: false });
  }

  console.log("\nDone.");
  console.log(
    JSON.stringify(
      created.map((item) => ({
        company: item.company,
        role: item.role,
        year_range: item.year_range,
        employment_type: item.employment_type,
        skipped: item.skipped,
      })),
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
