import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import {
  optionSetsListEnvelope,
  optionSetSchema,
  listOptionSetsQuerySchema,
  buildOptionSetsQuery,
  optionSetOptionSchema,
  optionSetOptionsListSchema,
  type OptionSet,
  type ListOptionSetsQuery,
  type OptionSetOption,
} from "../types/question-banks.types";

function buildListPath(raw?: Partial<ListOptionSetsQuery>): string {
  if (!raw) return "/option-sets";
  const parsed = listOptionSetsQuerySchema.safeParse(raw);
  if (!parsed.success)
    throw new Error("Invalid option set list query parameters");
  return "/option-sets" + buildOptionSetsQuery(parsed.data);
}

export async function listOptionSets(
  params?: Partial<ListOptionSetsQuery>
): Promise<{ data: OptionSet[]; meta: unknown }> {
  const path = buildListPath(params);
  const res = await apiRequest(path, null, null);
  const validated = optionSetsListEnvelope.safeParse({
    data: res.data,
    meta: res.meta,
  });
  if (!validated.success)
    throw new Error(
      "Option set list validation failed: " + validated.error.message
    );
  return validated.data;
}

export async function getOptionSet(id: number): Promise<OptionSet> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("Option set id must be positive");
  const res = await apiRequest(`/option-sets/${id}`, null, optionSetSchema);
  return res as unknown as OptionSet;
}

export const createOptionSetBody = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  description: z.string().optional(),
  meta: z.any().optional(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        order: z.number().int().nonnegative().optional(),
        meta: z.any().optional(),
      })
    )
    .optional(),
});
export type CreateOptionSetBody = z.infer<typeof createOptionSetBody>;
export async function createOptionSet(body: CreateOptionSetBody) {
  const res = await apiRequest(
    "/option-sets",
    createOptionSetBody,
    optionSetSchema,
    { body }
  );
  return res as unknown as OptionSet;
}

export const updateOptionSetBody = createOptionSetBody.partial();
export type UpdateOptionSetBody = z.infer<typeof updateOptionSetBody>;
export async function updateOptionSet(id: number, body: UpdateOptionSetBody) {
  const res = await apiRequest(
    `/option-sets/${id}`,
    updateOptionSetBody,
    optionSetSchema,
    { method: "PATCH", body }
  );
  return res as unknown as OptionSet;
}

export async function deleteOptionSet(id: number) {
  await apiRequest(`/option-sets/${id}`, null, null, { method: "DELETE" });
  return { id };
}

// OptionSet Options operations (bulk replace & list mimic backend endpoints)
export const bulkReplaceOptionsBody = z.object({
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        order: z.number().int().nonnegative().optional(),
        meta: z.any().optional(),
      })
    )
    .min(0),
});
export type BulkReplaceOptionsBody = z.infer<typeof bulkReplaceOptionsBody>;
export async function bulkReplaceOptionSetOptions(
  optionSetId: number,
  body: BulkReplaceOptionsBody
): Promise<OptionSetOption[]> {
  const res = await apiRequest(
    `/option-set-options/${optionSetId}`,
    bulkReplaceOptionsBody,
    optionSetOptionsListSchema,
    { method: "POST", body }
  );
  return res as unknown as OptionSetOption[];
}

export async function listOptionSetOptions(
  optionSetId: number
): Promise<OptionSetOption[]> {
  const res = await apiRequest(
    `/option-set-options/${optionSetId}`,
    null,
    optionSetOptionsListSchema
  );
  return res as unknown as OptionSetOption[];
}

export const updateOptionSetOptionBody = z.object({
  label: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  value: z.string().optional(),
  meta: z.any().optional(),
});
export type UpdateOptionSetOptionBody = z.infer<
  typeof updateOptionSetOptionBody
>;
export async function updateOptionSetOption(
  id: number,
  body: UpdateOptionSetOptionBody
) {
  const res = await apiRequest(
    `/option-set-options/${id}`,
    updateOptionSetOptionBody,
    optionSetOptionSchema,
    { method: "PATCH", body }
  );
  return res as unknown as OptionSetOption;
}

export async function deleteOptionSetOption(id: number) {
  await apiRequest(`/option-set-options/${id}`, null, null, {
    method: "DELETE",
  });
  return { id };
}
