export const PROJECT_CATEGORIES = [
  "packaging",
  "web",
  "detail_page",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const EMPLOYMENT_TYPES = [
  "regular",
  "freelancer",
  "contract",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string | null;
  thumbnail_url: string | null;
  images: string[] | null;
  display_order: number | null;
  brand: string | null;
  participation: string | null;
  project_year: string | null;
};

export type Career = {
  id: string;
  year_range: string;
  company: string;
  role: string;
  employment_type: EmploymentType;
  description: string | null;
  display_order: number | null;
};

export const CATEGORY_LABELS: Record<ProjectCategory | "all", string> = {
  all: "전체",
  packaging: "상세페이지",
  web: "웹디자인",
  detail_page: "패키징",
};

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  regular: "정규직",
  freelancer: "프리랜서",
  contract: "계약직",
};
