"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { CareersManager } from "@/components/admin/careers-manager";
import { LoginForm } from "@/components/admin/login-form";
import { ProjectsManager } from "@/components/admin/projects-manager";
import { createBrowserClient } from "@/lib/supabase/client";

type Tab = "projects" | "careers";

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("projects");

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-400">
        Loading...
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm tracking-[0.18em]">ADMIN</p>
          <button
            type="button"
            onClick={() => createBrowserClient().auth.signOut()}
            className="text-xs text-neutral-500 hover:text-foreground"
          >
            로그아웃
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex gap-4 text-sm">
          <button
            type="button"
            onClick={() => setTab("projects")}
            className={tab === "projects" ? "text-foreground" : "text-neutral-400"}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => setTab("careers")}
            className={tab === "careers" ? "text-foreground" : "text-neutral-400"}
          >
            Careers
          </button>
        </div>
        {tab === "projects" ? <ProjectsManager /> : <CareersManager />}
      </div>
    </div>
  );
}
