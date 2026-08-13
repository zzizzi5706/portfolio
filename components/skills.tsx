import Image from "next/image";
import { SkillIcon } from "@/components/skill-icons";
import { skills } from "@/lib/site";

function Stars() {
  return (
    <span className="mt-1 flex gap-0.5 text-[13px] leading-none tracking-tight text-amber-300">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} aria-hidden>
          ★
        </span>
      ))}
      <span className="sr-only">5 out of 5</span>
    </span>
  );
}

export function Skills() {
  return (
    <section id="skills" className="relative isolate overflow-hidden scroll-mt-20">
      <Image
        src="/skills-bg.jpg"
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/72" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold tracking-[0.42em] text-white md:text-5xl">
            SKILLS
          </h2>
          <span className="mt-6 block h-px w-16 bg-white/70" />
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <li key={skill.name} className="flex items-center gap-4">
              <SkillIcon id={skill.icon} />
              <div className="min-w-0">
                <p className="font-bold text-white">{skill.name}</p>
                <Stars />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
