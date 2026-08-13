import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkImageColumns } from "@/components/work-image-columns";
import { getProject } from "@/lib/supabase/queries";
import { CATEGORY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.description ?? undefined,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const images = (project.images ?? []).filter(Boolean);
  const brandLabel = project.brand?.trim() || CATEGORY_LABELS[project.category];
  const hasParticipation = Boolean(project.participation?.trim());
  const hasYear = Boolean(project.project_year?.trim());

  return (
    <main>
      <article className="lg:grid lg:grid-cols-[minmax(300px,38%)_1fr]">
        <aside className="bg-background px-6 py-16 md:px-12 lg:sticky lg:top-0 lg:h-svh lg:overflow-y-auto lg:px-14 lg:py-20">
          <Link
            href="/#work"
            className="text-sm text-neutral-400 transition-colors hover:text-foreground"
          >
            ← 목록으로
          </Link>
          <p className="mt-14 text-xs tracking-[0.18em] text-neutral-400">
            Design for {brandLabel}
          </p>
          <h1 className="mt-5 text-3xl font-medium leading-tight tracking-tight md:text-4xl lg:text-[2.6rem]">
            {project.title}
          </h1>
          {project.description ? (
            <p className="mt-8 max-w-md whitespace-pre-line text-sm leading-7 text-neutral-500">
              {project.description}
            </p>
          ) : null}
          {hasParticipation || hasYear ? (
            <div className="mt-14 space-y-5">
              <p className="text-xs tracking-[0.18em] text-neutral-400">
                Participation & Timeline
              </p>
              {hasParticipation ? (
                <div>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-400">
                    Participation
                  </p>
                  <p className="mt-1.5 text-sm text-neutral-600">
                    {project.participation}
                  </p>
                </div>
              ) : null}
              {hasYear ? (
                <div>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-400">
                    Timeline / Year
                  </p>
                  <p className="mt-1.5 text-sm text-neutral-600">
                    {project.project_year}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>

        <div className="min-w-0 bg-neutral-50">
          <WorkImageColumns images={images} alt={project.title} />
        </div>
      </article>
    </main>
  );
}
