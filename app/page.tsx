import { About } from "@/components/about";
import { CareerTimeline } from "@/components/career-timeline";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { WorkGallery } from "@/components/work-gallery";
import { getCareers, getProjects } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, careers] = await Promise.all([getProjects(), getCareers()]);

  return (
    <main>
      <Hero />
      <About />
      <WorkGallery projects={projects} />
      <CareerTimeline careers={careers} />
      <Skills />
      <Contact />
    </main>
  );
}
