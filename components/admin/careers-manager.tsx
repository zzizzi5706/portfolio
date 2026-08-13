"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  EMPLOYMENT_LABELS,
  EMPLOYMENT_TYPES,
  type Career,
  type EmploymentType,
} from "@/lib/types";

const inputClass =
  "mt-1 w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-foreground";

const emptyForm = {
  year_range: "",
  company: "",
  role: "",
  employment_type: "regular" as EmploymentType,
  description: "",
  display_order: 0,
};

export function CareersManager() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const { data, error } = await createBrowserClient()
      .from("careers")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }
    setCareers((data ?? []) as Career[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(career: Career) {
    setEditingId(career.id);
    setForm({
      year_range: career.year_range,
      company: career.company,
      role: career.role,
      employment_type: career.employment_type,
      description: career.description ?? "",
      display_order: career.display_order ?? 0,
    });
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      year_range: form.year_range,
      company: form.company,
      role: form.role,
      employment_type: form.employment_type,
      description: form.description || null,
      display_order: Number(form.display_order) || 0,
    };

    const supabase = createBrowserClient();
    const { error } = editingId
      ? await supabase.from("careers").update(payload).eq("id", editingId)
      : await supabase.from("careers").insert(payload);

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    reset();
    await load();
  }

  async function onDelete(id: string) {
    if (!window.confirm("이 경력을 삭제할까요?")) return;
    const { error } = await createBrowserClient().from("careers").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (editingId === id) reset();
    await load();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">경력 목록</h2>
          <button type="button" onClick={reset} className="text-xs text-neutral-500">
            새로 작성
          </button>
        </div>
        <ul className="divide-y divide-line border border-line bg-white">
          {careers.length === 0 ? (
            <li className="px-4 py-6 text-sm text-neutral-400">비어 있습니다.</li>
          ) : (
            careers.map((career) => (
              <li key={career.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => startEdit(career)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm">{career.company}</p>
                  <p className="text-xs text-neutral-400">{career.year_range}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(career.id)}
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  삭제
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <h2 className="text-sm font-medium">{editingId ? "경력 수정" : "경력 추가"}</h2>
        <label className="block text-xs text-neutral-500">
          기간
          <input
            required
            placeholder="2022 — 2024"
            value={form.year_range}
            onChange={(event) => setForm({ ...form, year_range: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          회사
          <input
            required
            value={form.company}
            onChange={(event) => setForm({ ...form, company: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          역할
          <input
            required
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          고용 형태
          <select
            value={form.employment_type}
            onChange={(event) =>
              setForm({
                ...form,
                employment_type: event.target.value as EmploymentType,
              })
            }
            className={inputClass}
          >
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-neutral-500">
          설명
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          표시 순서
          <input
            type="number"
            value={form.display_order}
            onChange={(event) =>
              setForm({ ...form, display_order: Number(event.target.value) })
            }
            className={inputClass}
          />
        </label>
        {message ? <p className="text-sm text-red-600">{message}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="bg-foreground px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
