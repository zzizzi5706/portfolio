"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const subject = encodeURIComponent(`[포트폴리오 문의] ${name}`);
    const body = encodeURIComponent(
      `이름: ${name}\n이메일: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 4000);
  }

  const inputClass =
    "mt-1.5 w-full border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-foreground";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-16 grid max-w-xl gap-5 border-t border-line pt-16"
    >
      <p className="text-xs tracking-[0.18em] uppercase text-neutral-400">
        Send a message
      </p>
      <label className="block text-xs text-neutral-500">
        이름
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className={inputClass}
        />
      </label>
      <label className="block text-xs text-neutral-500">
        이메일
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>
      <label className="block text-xs text-neutral-500">
        문의 내용
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="프로젝트에 대해 알려주세요"
          className={inputClass}
        />
      </label>
      <div>
        <button
          type="submit"
          className="border border-foreground bg-foreground px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
        >
          보내기
        </button>
        {submitted ? (
          <p className="mt-3 text-sm text-neutral-500">
            감사합니다! 메일 앱이 열렸습니다.
          </p>
        ) : null}
      </div>
    </form>
  );
}
