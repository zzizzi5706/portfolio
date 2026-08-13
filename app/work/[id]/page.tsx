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
    <main className="work-page w-full">
      <article className="grid w-full grid-cols-1 items-start min-[1200px]:grid-cols-[minmax(0,32%)_minmax(0,1fr)] min-[1200px]:gap-x-10">
        <aside className="box-border h-auto min-w-0 w-full self-start bg-background px-6 py-10 min-[1200px]:sticky min-[1200px]:top-0 min-[1200px]:pl-8 min-[1200px]:pr-0 min-[1200px]:py-10">
          <Link
            href="/#work"
            className="text-sm text-neutral-400 transition-colors hover:text-foreground"
          >
            ← 목록으로
          </Link>
          <p className="mt-10 max-w-full break-words text-xs tracking-[0.18em] text-neutral-400">
            Design for {brandLabel}
          </p>
          <h1 className="mt-5 max-w-full break-words text-3xl font-medium leading-tight tracking-tight md:text-4xl min-[1200px]:text-[2.4rem]">
            {project.title}
          </h1>
          {project.description ? (
            <p className="mt-6 max-w-full break-words whitespace-pre-line text-sm leading-7 text-neutral-500">
              {project.description}
            </p>
          ) : null}
          {hasParticipation || hasYear ? (
            <div className="mt-10 space-y-5">
              <p className="text-xs tracking-[0.18em] text-neutral-400">
                Participation & Timeline
              </p>
              {hasParticipation ? (
                <div>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-400">
                    Participation
                  </p>
                  <p className="mt-1.5 break-words text-sm text-neutral-600">
                    {project.participation}
                  </p>
                </div>
              ) : null}
              {hasYear ? (
                <div>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-400">
                    Timeline / Year
                  </p>
                  <p className="mt-1.5 break-words text-sm text-neutral-600">
                    {project.project_year}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>

        <div className="min-w-0 w-full bg-neutral-50">
          <WorkImageColumns images={images} alt={project.title} />
        </div>
      </article>
    </main>
  );
}
