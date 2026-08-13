import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <main className="pt-24">
      <article className="mx-auto max-w-3xl px-6 pb-24 md:pb-32">
        <Link
          href="/#work"
          className="text-sm text-neutral-400 transition-colors hover:text-foreground"
        >
          ← Work
        </Link>
        <p className="mt-10 text-xs tracking-[0.22em] uppercase text-neutral-400">
          {CATEGORY_LABELS[project.category]}
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
          {project.title}
        </h1>
        {project.description ? (
          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-neutral-500 md:text-[15px]">
            {project.description}
          </p>
        ) : null}
        <div className="mt-16 space-y-8">
          {images.length === 0 ? (
            <p className="text-sm text-neutral-400">이미지가 없습니다.</p>
          ) : (
            images.map((src) => (
              <div key={src} className="overflow-hidden bg-neutral-100">
                <Image
                  src={src}
                  alt={project.title}
                  width={1600}
                  height={2000}
                  className="h-auto w-full"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ))
          )}
        </div>
      </article>
    </main>
  );
}
