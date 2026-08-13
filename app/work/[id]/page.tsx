import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/supabase/queries";

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
  const timeline = [project.participation, project.project_year]
    .filter(Boolean)
    .join(" / ");

  return (
    <main className="pt-16">
      <article className="lg:grid lg:grid-cols-[minmax(300px,42%)_1fr]">
        <aside className="bg-background px-6 py-16 md:px-12 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] lg:overflow-y-auto lg:px-14 lg:py-20">
          <Link
            href="/#work"
            className="text-sm text-neutral-400 transition-colors hover:text-foreground"
          >
            ← Work
          </Link>
          <p className="mt-14 text-xs tracking-[0.18em] text-neutral-400">
            Design for {project.title}
          </p>
          <h1 className="mt-5 text-3xl font-medium leading-tight tracking-tight md:text-4xl lg:text-[2.6rem]">
            {project.title}
          </h1>
          {project.description ? (
            <p className="mt-8 max-w-md whitespace-pre-line text-sm leading-7 text-neutral-500">
              {project.description}
            </p>
          ) : null}
          {timeline ? (
            <div className="mt-14">
              <p className="text-xs tracking-[0.18em] text-neutral-400">
                Participation & Timeline
              </p>
              <p className="mt-3 text-sm text-neutral-600">{timeline}</p>
            </div>
          ) : null}
        </aside>

        <div className="bg-neutral-100">
          {images.length === 0 ? (
            <p className="px-6 py-24 text-sm text-neutral-400">
              이미지가 없습니다.
            </p>
          ) : (
            images.map((src) => (
              <Image
                key={src}
                src={src}
                alt={project.title}
                width={1600}
                height={2000}
                className="block h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            ))
          )}
        </div>
      </article>
    </main>
  );
}
