"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFadeInOnScroll } from "@/lib/use-fade-in-on-scroll";
import { CATEGORY_LABELS, type Project, type ProjectCategory } from "@/lib/types";

type FilterKey = "all" | ProjectCategory;

const FILTERS: FilterKey[] = ["all", "packaging", "web", "detail_page"];
const FADE_MS = 300;
const INITIAL_COUNT = 9;
const PAGE_SIZE = 9;

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
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [visibleFilter, setVisibleFilter] = useState<FilterKey>("all");
  const [fading, setFading] = useState(false);
  const [shown, setShown] = useState(INITIAL_COUNT);

  const filtered = useMemo(() => {
    if (visibleFilter === "all") return projects;
    return projects.filter((project) => project.category === visibleFilter);
  }, [visibleFilter, projects]);

  const visible = filtered.slice(0, shown);
  const hasMore = filtered.length > shown;

  useEffect(() => {
    setShown(INITIAL_COUNT);
  }, [filter]);

  useFadeInOnScroll(gridRef, ".work-fade-card", [visibleFilter, shown]);

  useEffect(() => {
    if (filter === visibleFilter) return undefined;
    setFading(true);
    const swap = window.setTimeout(() => {
      setVisibleFilter(filter);
    }, FADE_MS);
    return () => window.clearTimeout(swap);
  }, [filter, visibleFilter]);

  useEffect(() => {
    if (!fading || filter !== visibleFilter) return undefined;
    const frame = window.requestAnimationFrame(() => setFading(false));
    return () => window.cancelAnimationFrame(frame);
  }, [fading, filter, visibleFilter]);

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
          <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
            <div
              className="flex w-max flex-nowrap gap-1 md:w-auto md:flex-wrap"
              role="tablist"
              aria-label="프로젝트 카테고리"
            >
              {FILTERS.map((key) => {
                const selected = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilter(key)}
                    className={`shrink-0 border-b px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                      selected
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent font-normal text-neutral-400 hover:text-foreground"
                    }`}
                  >
                    {CATEGORY_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p
            className={`mt-16 text-sm text-neutral-400 transition-opacity duration-300 ease-out ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            아직 등록된 프로젝트가 없습니다.
          </p>
        ) : (
          <>
            <div
              ref={gridRef}
              key={visibleFilter}
              className={`mt-12 grid grid-cols-1 gap-3 md:grid-cols-12 ${
                fading ? "opacity-0" : "opacity-100"
              }`}
              style={{ transition: "opacity 0.3s ease-out" }}
            >
              {visible.map((project, index) => (
                <div
                  key={project.id}
                  className={`work-fade-card col-span-1 ${spans[index % spans.length]}`}
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
                  onClick={() => setShown((count) => count + PAGE_SIZE)}
                  className="min-h-11 min-w-[8.5rem] border border-neutral-300 px-8 py-2.5 text-sm tracking-wide text-neutral-600 transition-colors hover:border-foreground hover:text-foreground"
                >
                  더보기
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
