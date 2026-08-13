import type { Career, Project } from "@/lib/types";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/client";

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await createServerClient()
    .from("projects")
    .select(
      "id, title, category, description, thumbnail_url, images, display_order",
    )
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load projects:", error.message);
    return [];
  }

  return (data ?? []) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await createServerClient()
    .from("projects")
    .select(
      "id, title, category, description, thumbnail_url, images, display_order",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load project:", error.message);
    return null;
  }

  return data as Project | null;
}

export async function getCareers(): Promise<Career[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await createServerClient()
    .from("careers")
    .select(
      "id, year_range, company, role, employment_type, description, display_order",
    )
    .order("display_order", { ascending: true })
    .order("year_range", { ascending: false });

  if (error) {
    console.error("Failed to load careers:", error.message);
    return [];
  }

  const careers = (data ?? []) as Career[];
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
