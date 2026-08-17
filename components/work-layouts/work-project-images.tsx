import { CATEGORY_LABELS, type ProjectCategory } from "@/lib/types";
import { DetailPageLayout } from "@/components/work-layouts/detail-page-layout";
import { PackagingLayout } from "@/components/work-layouts/packaging-layout";
import { WebDesignLayout } from "@/components/work-layouts/web-design-layout";

export function WorkProjectImages({
  category,
  images,
  alt,
}: {
  category: ProjectCategory;
  images: string[];
  alt: string;
}) {
  const label = CATEGORY_LABELS[category];

  if (label === "상세페이지") {
    return <DetailPageLayout images={images} alt={alt} />;
  }

  if (label === "패키징") {
    return <PackagingLayout images={images} alt={alt} />;
  }

  return <WebDesignLayout images={images} alt={alt} />;
}
