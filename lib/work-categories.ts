import { CATEGORY_LABELS, type ProjectCategory } from "@/lib/types";

export const WORK_CATEGORY_SLUGS = [
  "detail-page",
  "web-design",
  "packaging",
] as const;

export type WorkCategorySlug = (typeof WORK_CATEGORY_SLUGS)[number];

const LABEL_TO_SLUG: Record<string, WorkCategorySlug> = {
  상세페이지: "detail-page",
  웹디자인: "web-design",
  패키징: "packaging",
};

export function isWorkCategorySlug(value: string): value is WorkCategorySlug {
  return (WORK_CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function slugFromCategory(category: ProjectCategory): WorkCategorySlug {
  const slug = LABEL_TO_SLUG[CATEGORY_LABELS[category]];
  if (!slug) {
    throw new Error(`No work slug for category ${category}`);
  }
  return slug;
}

export function categoryFromSlug(slug: string): ProjectCategory | null {
  if (!isWorkCategorySlug(slug)) return null;
  const match = (Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).find(
    (key) => key !== "all" && LABEL_TO_SLUG[CATEGORY_LABELS[key]] === slug,
  );
  return match && match !== "all" ? match : null;
}

export function labelFromSlug(slug: WorkCategorySlug) {
  const category = categoryFromSlug(slug);
  return category ? CATEGORY_LABELS[category] : slug;
}

export const WORK_CATEGORY_NAV: Array<{
  href: string;
  label: string;
  slug: WorkCategorySlug | null;
}> = [
  { href: "/#work", label: CATEGORY_LABELS.all, slug: null },
  ...(["packaging", "web", "detail_page"] as ProjectCategory[]).map((category) => ({
    href: `/work/${slugFromCategory(category)}`,
    label: CATEGORY_LABELS[category],
    slug: slugFromCategory(category),
  })),
];
