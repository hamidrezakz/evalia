import { createHash } from 'crypto';

export async function generateUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const normalized = normalizeSlug(base);
  if (!(await exists(normalized))) return normalized;
  let i = 1;
  while (true) {
    const candidate = `${normalized}-${i}`;
    if (!(await exists(candidate))) return candidate;
    i++;
    if (i > 5000) throw new Error('Slug generation overflow');
  }
}

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
