import { WorkPackagingImages } from "@/components/work-packaging-images";

export function PackagingLayout({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  return <WorkPackagingImages images={images} alt={alt} />;
}
