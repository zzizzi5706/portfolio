import Link from "next/link";
import { WORK_CATEGORY_NAV, type WorkCategorySlug } from "@/lib/work-categories";

export function WorkCategoryNav({
  activeSlug = null,
}: {
  activeSlug?: WorkCategorySlug | null;
}) {
  return (
    <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
      <div
        className="flex w-max flex-nowrap gap-1 md:w-auto md:flex-wrap"
        aria-label="프로젝트 카테고리"
      >
        {WORK_CATEGORY_NAV.map((item) => {
          const selected = item.slug === activeSlug;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={selected ? "page" : undefined}
              className={`shrink-0 border-b px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                selected
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent font-normal text-neutral-400 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
