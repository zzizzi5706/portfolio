"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { uploadPortfolioImage } from "@/lib/supabase/storage";
import {
  CATEGORY_LABELS,
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategory,
} from "@/lib/types";

const inputClass =
  "mt-1 w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-foreground";

type ProjectForm = {
  title: string;
  category: ProjectCategory;
  description: string;
  participation: string;
  project_year: string;
  thumbnail_url: string;
  images: string[];
  display_order: number;
  thumbnailFile: File | null;
  galleryFiles: File[];
};

const emptyForm: ProjectForm = {
  title: "",
  category: "packaging",
  description: "",
  participation: "",
  project_year: "",
  thumbnail_url: "",
  images: [],
  display_order: 0,
  thumbnailFile: null,
  galleryFiles: [],
};

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const { data, error } = await createBrowserClient()
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }
    setProjects((data ?? []) as Project[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description ?? "",
      participation: project.participation ?? "",
      project_year: project.project_year ?? "",
      thumbnail_url: project.thumbnail_url ?? "",
      images: project.images ?? [],
      display_order: project.display_order ?? 0,
      thumbnailFile: null,
      galleryFiles: [],
    });
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let thumbnailUrl = form.thumbnail_url;
      let imageUrls = [...form.images];

      if (form.thumbnailFile) {
        thumbnailUrl = await uploadPortfolioImage(form.thumbnailFile, "projects");
      }

      if (form.galleryFiles.length > 0) {
        const uploaded = await Promise.all(
          form.galleryFiles.map((file) => uploadPortfolioImage(file, "projects")),
        );
        imageUrls = [...imageUrls, ...uploaded];
      }

      const payload = {
        title: form.title,
        category: form.category,
        description: form.description || null,
        participation: form.participation || null,
        project_year: form.project_year || null,
        thumbnail_url: thumbnailUrl || null,
        images: imageUrls,
        display_order: Number(form.display_order) || 0,
      };

      const supabase = createBrowserClient();
      const { error } = editingId
        ? await supabase.from("projects").update(payload).eq("id", editingId)
        : await supabase.from("projects").insert(payload);

      if (error) throw new Error(error.message);

      reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("이 프로젝트를 삭제할까요?")) return;
    const { error } = await createBrowserClient().from("projects").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (editingId === id) reset();
    await load();
  }

  const thumbnailPreview = useMemo(() => {
    if (!form.thumbnailFile) return form.thumbnail_url;
    return URL.createObjectURL(form.thumbnailFile);
  }, [form.thumbnailFile, form.thumbnail_url]);

  const galleryPreviews = useMemo(
    () => form.galleryFiles.map((file) => URL.createObjectURL(file)),
    [form.galleryFiles],
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreview.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryPreviews]);

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">프로젝트 목록</h2>
          <button type="button" onClick={reset} className="text-xs text-neutral-500">
            새로 작성
          </button>
        </div>
        <ul className="divide-y divide-line border border-line bg-white">
          {projects.length === 0 ? (
            <li className="px-4 py-6 text-sm text-neutral-400">비어 있습니다.</li>
          ) : (
            projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => startEdit(project)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm">{project.title}</p>
                  <p className="text-xs text-neutral-400">
                    {CATEGORY_LABELS[project.category]}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(project.id)}
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
        <h2 className="text-sm font-medium">
          {editingId ? "프로젝트 수정" : "프로젝트 추가"}
        </h2>
        <label className="block text-xs text-neutral-500">
          제목
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          카테고리
          <select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                category: event.target.value as ProjectCategory,
              }))
            }
            className={inputClass}
          >
            {PROJECT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-neutral-500">
          설명
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          참여율
          <input
            placeholder="100% 개인 작업"
            value={form.participation}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, participation: event.target.value }))
            }
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          연도 / 기간
          <input
            placeholder="2025"
            value={form.project_year}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, project_year: event.target.value }))
            }
            className={inputClass}
          />
        </label>
        <label className="block text-xs text-neutral-500">
          표시 순서
          <input
            type="number"
            value={form.display_order}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                display_order: Number(event.target.value),
              }))
            }
            className={inputClass}
          />
        </label>
        <div>
          <p className="text-xs text-neutral-500">썸네일</p>
          {thumbnailPreview ? (
            <img src={thumbnailPreview} alt="" className="mt-2 h-28 w-28 object-cover" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            className="mt-2 block text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setForm((prev) => ({ ...prev, thumbnailFile: file }));
            }}
          />
        </div>
        <div>
          <p className="text-xs text-neutral-500">상세 이미지</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {form.images.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="h-20 w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      images: prev.images.filter((item) => item !== url),
                    }))
                  }
                  className="absolute right-1 top-1 bg-white/90 px-1.5 text-[10px]"
                >
                  삭제
                </button>
              </div>
            ))}
            {form.galleryFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative">
                <img
                  src={galleryPreviews[index]}
                  alt=""
                  className="h-20 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      galleryFiles: prev.galleryFiles.filter((_, i) => i !== index),
                    }))
                  }
                  className="absolute right-1 top-1 bg-white/90 px-1.5 text-[10px]"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block text-sm"
            onChange={(event) => {
              const files = [...(event.target.files ?? [])];
              setForm((prev) => ({
                ...prev,
                galleryFiles: [...prev.galleryFiles, ...files],
              }));
              event.target.value = "";
            }}
          />
        </div>
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
