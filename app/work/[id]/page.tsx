import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkProjectImages } from "@/components/work-layouts/work-project-images";
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
        <aside className="box-border h-auto min-w-0 w-full self-start bg-background px-6 py-8 min-[1200px]:sticky min-[1200px]:top-0 min-[1200px]:pl-8 min-[1200px]:pr-0 min-[1200px]:py-8">
          <Link
            href="/#work"
            className="text-base text-neutral-400 transition-colors hover:text-foreground"
          >
            ← 목록으로
          </Link>
          <p className="mt-5 max-w-full break-words text-sm tracking-[0.18em] text-neutral-400">
            Design for {brandLabel}
          </p>
          <h1 className="mt-3 max-w-full break-words text-5xl font-medium leading-[1.12] tracking-tight md:text-6xl min-[1200px]:text-[3.6rem]">
            {project.title}
          </h1>
          {project.description ? (
            <p className="mt-5 max-w-full break-words whitespace-pre-line text-base leading-8 text-neutral-500 md:text-lg md:leading-9">
              {project.description}
            </p>
          ) : null}
          {hasParticipation || hasYear ? (
            <div className="mt-7 space-y-5">
              <p className="text-sm tracking-[0.18em] text-neutral-400">
                Participation & Timeline
              </p>
              {hasParticipation ? (
                <div>
                  <p className="text-xs tracking-[0.16em] uppercase text-neutral-400">
                    Participation
                  </p>
                  <p className="mt-1.5 break-words text-base text-neutral-600">
                    {project.participation}
                  </p>
                </div>
              ) : null}
              {hasYear ? (
                <div>
                  <p className="text-xs tracking-[0.16em] uppercase text-neutral-400">
                    Timeline / Year
                  </p>
                  <p className="mt-1.5 break-words text-base text-neutral-600">
                    {project.project_year}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>

        <div className="image-columns-wrap min-w-0 w-full bg-neutral-50">
          <WorkProjectImages
            category={project.category}
            images={images}
            alt={project.title}
          />
        </div>
      </article>
    </main>
  );
}
