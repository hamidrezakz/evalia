/**
 * Normalize Iranian phone fragments for search.
 * Rules:
 * - Strip all chars except digits and plus.
 * - If starts with 0 and length >=4 convert 0XXXXXXXXX* prefix to +98XXXXXXXX* (remove leading 0).
 * - If starts with 98 and not already +98, prefix +.
 * - If starts with 9 and length >=4 (user omitted 0), also produce +989... variant.
 * Returns an object with:
 *   primary: preferred normalized fragment (may still be partial)
 *   variants: unique set including raw (digits only) and normalized forms for backend assistance if needed.
 */
export function normalizeIranPhoneFragment(fragment: string) {
  const raw = (fragment || "").trim();
  const cleaned = raw.replace(/[^0-9+]/g, "");
  const variants = new Set<string>();
  if (!cleaned) return { primary: "", variants: [] as string[] };

  const add = (v: string) => {
    if (v && v.length >= 3) variants.add(v);
  };
  add(cleaned);

  // 0XXXXXXXX -> +98XXXXXXXX (remove first 0)
  if (cleaned.startsWith("0") && cleaned.length >= 4) {
    add("+98" + cleaned.substring(1));
  }
  // 9XXXXXXXX -> +989XXXXXXXX (user omitted leading 0)
  if (cleaned.startsWith("9") && cleaned.length >= 4) {
    add("+98" + cleaned);
  }
  // 98XXXXXXXX (missing plus)
  if (cleaned.startsWith("98") && !cleaned.startsWith("+98")) {
    add("+" + cleaned);
  }
  // Already +98...
  if (cleaned.startsWith("+98")) add(cleaned);

  // Decide primary: prefer the +98* variant if exists.
  const primary =
    Array.from(variants).find((v) => v.startsWith("+98")) || cleaned;
  return { primary, variants: Array.from(variants) };
}
