import { site } from "@/lib/site";

const items = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/-/g, "")}` },
  {
    label: "Instagram",
    value: site.instagramHandle,
    href: site.instagram,
  },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">
          Contact
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
          프로젝트 문의
        </h2>
        <ul className="mt-16 grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.label}>
              <p className="text-xs tracking-[0.18em] uppercase text-neutral-400">
                {item.label}
              </p>
              <a
                href={item.href}
                className="mt-2 inline-block text-lg transition-opacity hover:opacity-60"
                target={item.label === "Instagram" ? "_blank" : undefined}
                rel={item.label === "Instagram" ? "noreferrer" : undefined}
              >
                {item.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
