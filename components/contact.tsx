import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

const items = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/-/g, "")}` },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <ul className="grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.label}>
              <p className="text-xs tracking-[0.18em] uppercase text-neutral-400">
                {item.label}
              </p>
              <a
                href={item.href}
                className="mt-2 inline-block text-lg transition-opacity hover:opacity-60"
              >
                {item.value}
              </a>
            </li>
          ))}
        </ul>
        <ContactForm />
      </div>
    </section>
  );
}
