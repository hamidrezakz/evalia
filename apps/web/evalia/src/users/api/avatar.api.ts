import { tokenStorage } from "@/lib/token-storage";

export interface UploadedAsset {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  type: string;
}

export async function uploadAvatar(file: File): Promise<UploadedAsset> {
  let rawBase = process.env.NEXT_PUBLIC_API_BASE || "api.evalia.ir";
  if (!/^https?:\/\//i.test(rawBase))
    rawBase = "https://" + rawBase.replace(/^\/+/, "");
  const base = rawBase.replace(/\/$/, "");
  const tokens = tokenStorage.get();
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", "AVATAR");
  const res = await fetch(base + "/assets", {
    method: "POST",
    body: fd,
    headers: {
      ...(tokens?.accessToken
        ? { Authorization: `Bearer ${tokens.accessToken}` }
        : {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Upload failed");
  }
  const json = await res.json();
  // our api envelope: { success, code, message, error, data, meta, tookMs }
  const data = (json?.data ?? json) as UploadedAsset;
  return data;
}

export async function updateUserAvatar(userId: number, avatarAssetId: number) {
  let rawBase = process.env.NEXT_PUBLIC_API_BASE || "api.evalia.ir";
  if (!/^https?:\/\//i.test(rawBase))
    rawBase = "https://" + rawBase.replace(/^\/+/, "");
  const base = rawBase.replace(/\/$/, "");
  const tokens = tokenStorage.get();
  const res = await fetch(base + `/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(tokens?.accessToken
        ? { Authorization: `Bearer ${tokens.accessToken}` }
        : {}),
    },
    body: JSON.stringify({ avatarAssetId }),
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Update user failed");
  }
  const json = await res.json();
  return json?.data ?? json;
}
