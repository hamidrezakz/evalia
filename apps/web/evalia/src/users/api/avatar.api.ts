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
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", "AVATAR");
  const envelope = await apiRequestMultipart<UploadedAsset>(
    "/assets",
    fd,
    uploadedAssetSchema
  );
  return envelope.data;
}

export async function updateUserAvatar(userId: number, avatarAssetId: number) {
  const res = await apiRequest(`/users/${userId}`, null, null, {
    method: "PATCH",
    body: { avatarAssetId } as any,
  });
  return res.data;
}
