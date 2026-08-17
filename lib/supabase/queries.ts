import { PLACEHOLDER_CAREERS } from "@/lib/placeholder-careers";
import type { Career, Project } from "@/lib/types";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/client";

function placeholderCareers(): Career[] {
  return PLACEHOLDER_CAREERS.map((career, index) => ({
    ...career,
    id: `placeholder-career-${index + 1}`,
  }));
}

const PROJECT_COLUMNS =
  "id, title, category, description, thumbnail_url, images, display_order, brand, participation, project_year, project_detail, category_detail, channel, scope, role";

const PROJECT_COLUMNS_BASIC =
  "id, title, category, description, thumbnail_url, images, display_order, brand, participation, project_year";

function withPackagingMeta(project: Omit<Project, "project_detail" | "category_detail" | "channel" | "scope" | "role"> & Partial<Project>): Project {
  return {
    ...project,
    project_detail: project.project_detail ?? null,
    category_detail: project.category_detail ?? null,
    channel: project.channel ?? null,
    scope: project.scope ?? null,
    role: project.role ?? null,
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];

  const client = createServerClient();
  const full = await client
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("display_order", { ascending: true });

  if (!full.error) {
    return (full.data ?? []).map((project) => withPackagingMeta(project as Project));
  }

  const basic = await client
    .from("projects")
    .select(PROJECT_COLUMNS_BASIC)
    .order("display_order", { ascending: true });

  if (basic.error) {
    console.error("Failed to load projects:", basic.error.message);
    return [];
  }

  return (basic.data ?? []).map((project) => withPackagingMeta(project as Project));
}

export async function getProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) return null;

  const client = createServerClient();
  const full = await client
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (!full.error) {
    return full.data ? withPackagingMeta(full.data as Project) : null;
  }

  const basic = await client
    .from("projects")
    .select(PROJECT_COLUMNS_BASIC)
    .eq("id", id)
    .maybeSingle();

  if (basic.error) {
    console.error("Failed to load project:", basic.error.message);
    return null;
  }

  return basic.data ? withPackagingMeta(basic.data as Project) : null;
}

export async function getCareers(): Promise<Career[]> {
  if (!isSupabaseConfigured()) return placeholderCareers();

  const { data, error } = await createServerClient()
    .from("careers")
    .select(
      "id, year_range, company, role, employment_type, description, display_order",
    )
    .order("display_order", { ascending: true })
    .order("year_range", { ascending: false });

  if (error) {
    console.error("Failed to load careers:", error.message);
    return placeholderCareers();
  }

  const careers = (data ?? []) as Career[];
  if (careers.length === 0) return placeholderCareers();

  return [...careers].sort((a, b) => {
    const yearA = latestYear(a.year_range);
    const yearB = latestYear(b.year_range);
    if (yearA !== yearB) return yearB - yearA;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });
}

function latestYear(range: string) {
  const years = [...range.matchAll(/\d{4}/g)].map((match) => Number(match[0]));
  return years.length ? Math.max(...years) : 0;
}
