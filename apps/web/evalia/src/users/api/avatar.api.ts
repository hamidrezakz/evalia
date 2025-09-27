import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import { apiRequestMultipart } from "@/lib/api/multipart";
import { tokenStorage } from "@/lib/token-storage";
import { resolveApiBase } from "@/lib/api/helpers";

export interface UploadedAsset {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  type: string;
}
const uploadedAssetSchema = z.object({
  id: z.number().int().positive(),
  url: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  type: z.string(),
});

export async function uploadAvatar(file: File): Promise<UploadedAsset> {
  const MAX_AVATAR_BYTES = 512 * 1024; // 512KB
  if (file.size > MAX_AVATAR_BYTES) {
    const err: any = new Error(
      "حجم تصویر آواتار نباید بیشتر از ۵۱۲ کیلوبایت باشد"
    );
    err.code = "AVATAR_FILE_TOO_LARGE";
    throw err;
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", "AVATAR");
  let envelope;
  try {
    envelope = await apiRequestMultipart<UploadedAsset>(
      "/assets",
      fd,
      uploadedAssetSchema
    );
  } catch (e: any) {
    // Map backend standardized error code to user-friendly message
    const msg = (e?.message || "").toUpperCase();
    if (
      msg.includes("AVATAR_FILE_TOO_LARGE") ||
      e?.code === "AVATAR_FILE_TOO_LARGE"
    ) {
      const err: any = new Error(
        "حجم تصویر آواتار نباید بیشتر از ۵۱۲ کیلوبایت باشد"
      );
      err.code = "AVATAR_FILE_TOO_LARGE";
      throw err;
    }
    throw e;
  }
  return envelope.data;
}

export async function updateUserAvatar(userId: number, avatarAssetId: number) {
  const res = await apiRequest(`/users/${userId}`, null, null, {
    method: "PATCH",
    body: { avatarAssetId } as any,
  });
  return res.data;
}
