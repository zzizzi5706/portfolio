"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const nav = [
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/#career", label: "Career" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isAdmin || pathname.startsWith("/work")) return null;

  const overlay = isHome && !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overlay
          ? "bg-transparent text-white"
          : "border-b border-line bg-white/90 text-foreground backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-medium tracking-wide">
          {site.nameEn}
        </Link>
        <nav className="flex items-center gap-6 text-[13px] tracking-wide">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                overlay
                  ? "opacity-80 transition-opacity hover:opacity-100"
                  : "text-neutral-500 transition-colors hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
