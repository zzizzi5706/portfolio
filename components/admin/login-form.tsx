"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await createBrowserClient().auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (authError) setError("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <p className="text-xs tracking-[0.28em] uppercase text-neutral-400">
          Admin
        </p>
        <h1 className="mt-3 text-2xl font-medium tracking-tight">로그인</h1>
        <label className="mt-8 block text-xs text-neutral-500">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground"
          />
        </label>
        <label className="mt-4 block text-xs text-neutral-500">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-foreground py-2.5 text-sm text-white transition-opacity disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
