import { isDetailPageCategory, isPackagingCategory, isWebDesignCategory, type ProjectCategory } from "@/lib/types";
import { DetailPageLayout } from "@/components/work-layouts/detail-page-layout";
import { PackagingLayout } from "@/components/work-layouts/packaging-layout";
import { WebDesignLayout } from "@/components/work-layouts/web-design-layout";
import {
  projectImageList,
  type ImageSize,
  type StoredProjectImage,
} from "@/lib/project-images";

export function WorkProjectImages({
  category,
  images,
  imageSizes,
  alt,
}: {
  category: ProjectCategory;
  images: Array<string | StoredProjectImage> | null | undefined;
  imageSizes?: (ImageSize | null)[];
  alt: string;
}) {
  const stored = projectImageList(images);
  const urls = stored.map((image) => image.url);
  const sizes = stored.map((image, index) =>
    image.width && image.height
      ? { width: image.width, height: image.height }
      : imageSizes?.[index] ?? null,
  );

  if (isDetailPageCategory(category)) {
    return <DetailPageLayout images={urls} imageSizes={sizes} alt={alt} />;
  }

  if (isWebDesignCategory(category)) {
    return <WebDesignLayout images={urls} alt={alt} />;
  }

  if (isPackagingCategory(category)) {
    return <PackagingLayout images={urls} alt={alt} />;
  }

  return <WebDesignLayout images={urls} alt={alt} />;
}
