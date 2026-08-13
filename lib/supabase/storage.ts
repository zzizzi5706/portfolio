import { createBrowserClient, STORAGE_BUCKET } from "@/lib/supabase/client";

export async function uploadPortfolioImage(file: File, folder: string) {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("로그인이 필요합니다. 다시 로그인한 뒤 저장해 주세요.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    throw new Error(error.message || "스토리지 업로드에 실패했습니다.");
  }

  const uploadedPath = data?.path ?? path;
  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(uploadedPath);

  if (!publicData?.publicUrl) {
    throw new Error("업로드된 이미지 URL을 만들지 못했습니다.");
  }

  return publicData.publicUrl;
}
