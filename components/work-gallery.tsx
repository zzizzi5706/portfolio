"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORY_LABELS, type Project, type ProjectCategory } from "@/lib/types";

const filters: Array<"all" | ProjectCategory> = [
  "all",
  "packaging",
  "web",
  "detail_page",
];

const spans = [
  "md:col-span-8 md:row-span-2 min-h-[380px] md:min-h-[520px]",
  "md:col-span-4 min-h-[240px]",
  "md:col-span-4 min-h-[240px]",
  "md:col-span-4 min-h-[300px]",
  "md:col-span-8 min-h-[300px]",
  "md:col-span-6 min-h-[340px]",
  "md:col-span-6 min-h-[340px]",
];

export function WorkGallery({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");

  const visible = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((project) => project.category === filter);
  }, [filter, projects]);

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
          <div className="flex flex-wrap gap-1">
            {filters.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`border-b px-3 py-1.5 text-sm transition-colors ${
                  filter === key
                    ? "border-foreground text-foreground"
                    : "border-transparent text-neutral-400 hover:text-foreground"
                }`}
              >
                {CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="mt-16 text-sm text-neutral-400">
            아직 등록된 프로젝트가 없습니다.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-12">
            {visible.map((project, index) => (
              <Link
                key={project.id}
                href={`/work/${project.id}`}
                className={`group relative col-span-1 overflow-hidden bg-neutral-100 ${spans[index % spans.length]}`}
              >
                {project.thumbnail_url ? (
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[11px] tracking-[0.18em] uppercase opacity-80">
                    {CATEGORY_LABELS[project.category]}
                  </p>
                  <h3 className="mt-1 text-lg font-medium">{project.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
