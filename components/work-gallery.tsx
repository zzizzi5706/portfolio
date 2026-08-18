import { WorkCategoryNav } from "@/components/work-category-nav";
import { WorkProjectGrid } from "@/components/work-project-grid";
import type { Project } from "@/lib/types";

export function WorkGallery({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">
              Work
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
              Selected Projects
            </h2>
          </div>
          <WorkCategoryNav />
        </div>
        <WorkProjectGrid
          projects={projects}
          initialCount={6}
          enableLoadMore={false}
        />
      </div>
    </section>
  );
}
