import { isDetailPageCategory, isPackagingCategory, isWebDesignCategory, type ProjectCategory } from "@/lib/types";
import { DetailPageLayout } from "@/components/work-layouts/detail-page-layout";
import { PackagingLayout } from "@/components/work-layouts/packaging-layout";
import { WebDesignLayout } from "@/components/work-layouts/web-design-layout";

export function WorkProjectImages({
  category,
  images,
  imageSizes,
  alt,
}: {
  category: ProjectCategory;
  images: string[];
  imageSizes?: ({ width: number; height: number } | null)[];
  alt: string;
}) {
  if (isDetailPageCategory(category)) {
    return (
      <DetailPageLayout images={images} imageSizes={imageSizes} alt={alt} />
    );
  }

  if (isWebDesignCategory(category)) {
    return <WebDesignLayout images={images} alt={alt} />;
  }

  if (isPackagingCategory(category)) {
    return <PackagingLayout images={images} alt={alt} />;
  }

  return <WebDesignLayout images={images} alt={alt} />;
}
