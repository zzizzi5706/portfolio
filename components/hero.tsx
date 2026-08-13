import Image from "next/image";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <Image
        src={site.heroImage}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
        <p className="mb-5 text-xs tracking-[0.32em] uppercase opacity-80">
          {site.title}
        </p>
        <h1 className="text-5xl font-medium tracking-tight md:text-7xl">
          {site.name}
        </h1>
        <p className="mt-6 max-w-md text-sm font-light leading-7 opacity-90 md:text-base">
          {site.intro}
        </p>
      </div>
    </section>
  );
}
