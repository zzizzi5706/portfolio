import { SkillIcon } from "@/components/skill-icons";
import { skills } from "@/lib/site";

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">
          Skills
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
          Tools
        </h2>
        <ul className="mt-16 max-w-2xl space-y-7">
          {skills.map((skill) => (
            <li key={skill.name}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <SkillIcon id={skill.icon} />
                  <span>{skill.name}</span>
                </span>
                <span className="text-neutral-400">{skill.level}%</span>
              </div>
              <div className="h-px bg-neutral-200">
                <div
                  className="h-px bg-foreground"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
