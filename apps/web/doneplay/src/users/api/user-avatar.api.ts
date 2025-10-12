import { z } from "zod";
import { apiRequestMultipart } from "@/lib/api/multipart";

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

/** Upload current user's avatar to /avatars/users/me */
export async function uploadMyAvatar(file: File): Promise<UploadedAsset> {
  const MAX_AVATAR_BYTES = 100 * 1024; // 100KB client guard
  if (file.size > MAX_AVATAR_BYTES) {
    const err: any = new Error(
      "حجم تصویر آواتار نباید بیشتر از ۱۰۰ کیلوبایت باشد"
    );
    err.code = "AVATAR_FILE_TOO_LARGE";
    throw err;
  }
  const fd = new FormData();
  fd.append("file", file);
  const envelope = await apiRequestMultipart<UploadedAsset>(
    `/avatars/users/me`,
    fd,
    uploadedAssetSchema
  );
  return envelope.data;
}
