import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">404</p>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        페이지를 찾을 수 없습니다
      </h1>
      <Link
        href="/"
        className="mt-8 text-sm text-neutral-500 transition-colors hover:text-foreground"
      >
        ← Home
      </Link>
    </main>
  );
}
