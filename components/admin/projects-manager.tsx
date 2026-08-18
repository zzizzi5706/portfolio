"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { mergeImageFiles, sliceLongImage, fileImageSize } from "@/lib/slice-long-image";
import { serializeStoredImage, storedImageUrl } from "@/lib/project-images";
import { uploadPortfolioImage } from "@/lib/supabase/storage";
import {
  CATEGORY_LABELS,
  PROJECT_CATEGORIES,
  isPackagingCategory,
  type Project,
  type ProjectCategory,
} from "@/lib/types";

const inputClass =
  "mt-1 w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-foreground";

type ProjectForm = {
  title: string;
  category: ProjectCategory;
  description: string;
  brand: string;
  participation: string;
  project_year: string;
  project_detail: string;
  category_detail: string;
  channel: string;
  scope: string;
  role: string;
  thumbnail_url: string;
  images: string[];
  display_order: number;
  thumbnailFile: File | null;
  galleryFiles: { file: File; width: number; height: number }[];
};

const emptyForm: ProjectForm = {
  title: "",
  category: "packaging",
  description: "",
  brand: "",
  participation: "",
  project_year: "",
  project_detail: "",
  category_detail: "",
  channel: "",
  scope: "",
  role: "",
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
  const [slicing, setSlicing] = useState(false);
  const [sliceCount, setSliceCount] = useState(0);
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
    setSliceCount(0);
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description ?? "",
      brand: project.brand ?? "",
      participation: project.participation ?? "",
      project_year: project.project_year ?? "",
      project_detail: project.project_detail ?? "",
      category_detail: project.category_detail ?? "",
      channel: project.channel ?? "",
      scope: project.scope ?? "",
      role: project.role ?? "",
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
          form.galleryFiles.map(async (item) => {
            const url = await uploadPortfolioImage(item.file, "projects");
            return serializeStoredImage({
              url,
              width: item.width,
              height: item.height,
            });
          }),
        );
        imageUrls = [...imageUrls, ...uploaded];
      }

      const payload = {
        title: form.title,
        category: form.category,
        description: form.description || null,
        brand: form.brand || null,
        participation: form.participation || null,
        project_year: form.project_year || null,
        project_detail: form.project_detail || null,
        category_detail: form.category_detail || null,
        channel: form.channel || null,
        scope: form.scope || null,
        role: form.role || null,
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
    () => form.galleryFiles.map((item) => URL.createObjectURL(item.file)),
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
          브랜드 / 클라이언트
          <input
            placeholder="브랜드명"
            value={form.brand}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, brand: event.target.value }))
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
        {isPackagingCategory(form.category) ? (
          <>
            <label className="block text-xs text-neutral-500">
              PROJECT
              <input
                placeholder="glowiest Dream Glow Beauty Mask"
                value={form.project_detail}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, project_detail: event.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-xs text-neutral-500">
              CATEGORY (제품 카테고리)
              <input
                placeholder="Beauty / Skincare"
                value={form.category_detail}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category_detail: event.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-xs text-neutral-500">
              CHANNEL
              <textarea
                rows={2}
                placeholder="Costco Korea / US / Canada, Amazon, ..."
                value={form.channel}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, channel: event.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-xs text-neutral-500">
              SCOPE
              <input
                placeholder="5 SKU"
                value={form.scope}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, scope: event.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className="block text-xs text-neutral-500">
              ROLE
              <textarea
                rows={2}
                placeholder="Package Design · Artwork · Production, 기여도 100%"
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value }))
                }
                className={inputClass}
              />
            </label>
          </>
        ) : (
          <>
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
          </>
        )}
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
            {form.images.map((value) => {
              const src = storedImageUrl(value);
              return (
              <div key={value} className="relative">
                <img src={src} alt="" className="h-20 w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      images: prev.images.filter((item) => item !== value),
                    }))
                  }
                  className="absolute right-1 top-1 bg-white/90 px-1.5 text-[10px]"
                >
                  삭제
                </button>
              </div>
              );
            })}
            {form.galleryFiles.map((item, index) => (
              <div key={`${item.file.name}-${index}`} className="relative">
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
              event.target.value = "";
              if (files.length === 0) return;
              void (async () => {
                const measured = await Promise.all(
                  files.map(async (file) => {
                    const size = await fileImageSize(file);
                    return { file, ...size };
                  }),
                );
                setForm((prev) => ({
                  ...prev,
                  galleryFiles: [...prev.galleryFiles, ...measured],
                }));
              })();
            }}
          />
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-xs text-neutral-500">긴 이미지 자동 분할</p>
            <p className="mt-1 text-[11px] leading-5 text-neutral-400">
              세로로 긴 상세페이지 이미지 1장을 올리면 여백을 기준으로 여러 장으로
              나눕니다. 저장 전에 미리보기로 확인할 수 있습니다.
            </p>
            <input
              type="file"
              accept="image/*"
              disabled={slicing}
              className="mt-2 block text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                void (async () => {
                  setSlicing(true);
                  setMessage("");
                  try {
                    const files = await sliceLongImage(file);
                    setSliceCount(files.length);
                    setForm((prev) => ({
                      ...prev,
                      galleryFiles: [...prev.galleryFiles, ...files],
                    }));
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "이미지 분할에 실패했습니다.",
                    );
                  } finally {
                    setSlicing(false);
                  }
                })();
              }}
            />
            {slicing ? (
              <p className="mt-2 text-sm text-neutral-500">분할 처리 중...</p>
            ) : null}
            {sliceCount > 0 && !slicing ? (
              <p className="mt-2 text-sm text-neutral-600">
                {sliceCount}조각으로 나눴습니다. 아래 미리보기에서 확인한 뒤 저장하세요.
              </p>
            ) : null}
            {form.galleryFiles.length > 1 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.galleryFiles.slice(0, -1).map((item, index) => (
                  <button
                    key={`${item.file.name}-merge-${index}`}
                    type="button"
                    className="text-[11px] text-neutral-500 underline"
                    onClick={() => {
                      const next = form.galleryFiles[index + 1];
                      if (!next) return;
                      void (async () => {
                        setSlicing(true);
                        try {
                          const merged = await mergeImageFiles(item.file, next.file);
                          setForm((prev) => {
                            const files = [...prev.galleryFiles];
                            files.splice(index, 2, merged);
                            return { ...prev, galleryFiles: files };
                          });
                          setSliceCount((prev) => Math.max(1, prev - 1));
                        } catch (error) {
                          setMessage(
                            error instanceof Error
                              ? error.message
                              : "조각을 합치지 못했습니다.",
                          );
                        } finally {
                          setSlicing(false);
                        }
                      })();
                    }}
                  >
                    {index + 1} + {index + 2} 합치기
                  </button>
                ))}
              </div>
            ) : null}
          </div>
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
