import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

loadEnvLocal();
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .replace(/\/rest\/v1\/?$/i, "")
  .replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Missing Supabase service role");

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase
  .from("projects")
  .update({
    project_detail: "glowiest Dream Glow Beauty Mask",
    category_detail: "Beauty / Skincare",
    channel: "Costco Korea / US / Canada, Amazon",
    scope: "5 SKU",
    role: "Package Design · Artwork · Production, 기여도 100%",
  })
  .eq("category", "detail_page")
  .like("title", "%(임시)%");

if (error) {
  console.error(error.message);
  console.error("Run supabase/migrate-packaging-meta.sql in the SQL editor first.");
  process.exit(1);
}

console.log("packaging sample meta updated");
