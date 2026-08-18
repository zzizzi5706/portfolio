"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useFadeInOnScroll } from "@/lib/use-fade-in-on-scroll";
import { CATEGORY_LABELS, type Project } from "@/lib/types";

const SPANS = [
  "md:col-span-8 md:row-span-2 min-h-[380px] md:min-h-[520px]",
  "md:col-span-4 min-h-[240px]",
  "md:col-span-4 min-h-[240px]",
  "md:col-span-4 min-h-[300px]",
  "md:col-span-8 min-h-[300px]",
  "md:col-span-6 min-h-[340px]",
  "md:col-span-6 min-h-[340px]",
];

export function WorkProjectGrid({
  projects,
  initialCount = 9,
  pageSize = 9,
  enableLoadMore = true,
}: {
  projects: Project[];
  initialCount?: number;
  pageSize?: number;
  enableLoadMore?: boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(initialCount);
  const visible = projects.slice(0, enableLoadMore ? shown : initialCount);
  const hasMore = enableLoadMore && projects.length > shown;

  useFadeInOnScroll(gridRef, ".work-fade-card", [shown, visible.length]);

  if (projects.length === 0) {
    return (
      <p className="mt-16 text-sm text-neutral-400">
        아직 등록된 프로젝트가 없습니다.
      </p>
    );
  }

  return (
    <>
      <div
        ref={gridRef}
        className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-12"
      >
        {visible.map((project, index) => (
          <div
            key={project.id}
            className={`work-fade-card col-span-1 ${SPANS[index % SPANS.length]}`}
          >
            <Link
              href={`/work/${project.id}`}
              className="group relative block h-full min-h-[240px] overflow-hidden bg-neutral-100 shadow-none transition-[transform,box-shadow] duration-200 ease-out hover:z-10 hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
            >
              {project.thumbnail_url ? (
                <Image
                  src={project.thumbnail_url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[11px] tracking-[0.18em] uppercase opacity-80">
                  {CATEGORY_LABELS[project.category]}
                </p>
                <h3 className="mt-1 text-lg font-medium">{project.title}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {hasMore ? (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((count) => count + pageSize)}
            className="min-h-11 min-w-[8.5rem] border border-neutral-300 px-8 py-2.5 text-sm tracking-wide text-neutral-600 transition-colors hover:border-foreground hover:text-foreground"
          >
            더보기
          </button>
        </div>
      ) : null}
    </>
  );
}
