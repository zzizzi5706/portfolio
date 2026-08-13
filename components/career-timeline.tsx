import { EMPLOYMENT_LABELS, type Career } from "@/lib/types";

export function CareerTimeline({ careers }: { careers: Career[] }) {
  return (
    <section id="career" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">
          Career
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
          Experience
        </h2>

        {careers.length === 0 ? (
          <p className="mt-16 text-sm text-neutral-400">
            아직 등록된 경력이 없습니다.
          </p>
        ) : (
          <ol className="mt-16">
            {careers.map((career) => (
              <li
                key={career.id}
                className="grid grid-cols-1 gap-3 border-t border-line py-8 md:grid-cols-[180px_1fr] md:gap-10"
              >
                <p className="text-sm text-neutral-400">{career.year_range}</p>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-medium">{career.company}</h3>
                    <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] tracking-wide text-neutral-500">
                      {EMPLOYMENT_LABELS[career.employment_type]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">{career.role}</p>
                  {career.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
                      {career.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
