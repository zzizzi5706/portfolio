"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-neutral-400">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="tracking-wide">{site.nameEn}</p>
      </div>
    </footer>
  );
}
