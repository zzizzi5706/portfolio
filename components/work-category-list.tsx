import Link from "next/link";
import { WorkCategoryNav } from "@/components/work-category-nav";
import { WorkProjectGrid } from "@/components/work-project-grid";
import type { Project } from "@/lib/types";
import type { WorkCategorySlug } from "@/lib/work-categories";

export function WorkCategoryList({
  slug,
  title,
  projects,
}: {
  slug: WorkCategorySlug;
  title: string;
  projects: Project[];
}) {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <Link
          href="/#work"
          className="text-sm text-neutral-400 transition-colors hover:text-foreground"
        >
          ← 전체 프로젝트로
        </Link>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">
              Work
            </p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
              {title}
            </h1>
          </div>
          <WorkCategoryNav activeSlug={slug} />
        </div>
        <WorkProjectGrid projects={projects} initialCount={9} pageSize={9} />
      </div>
    </main>
  );
}
