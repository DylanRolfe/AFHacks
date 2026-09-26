import { z } from "zod";
const text = z.string().trim().min(1).max(500);
const tags = z.array(text).max(30);
export const companySchema = z.object({
  name: text,
  headquarters: text,
  employeeCount: z.number().int().min(1).max(100000),
  regions: tags,
  capabilities: tags,
  certifications: tags,
  projects: z
    .array(
      z.object({
        id: text,
        title: text,
        clientType: text,
        year: z.number().int().min(1900).max(2200),
        valueRange: text,
        outcome: text,
        tags,
        referenceReady: z.boolean().optional(),
      }),
    )
    .max(30),
  insuranceExpiry: z
    .string()
    .max(30)
    .refine(
      (v) =>
        !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v))),
      "Use a valid insurance expiry date.",
    ),
  insuranceCoverageMillions: z.number().min(0).max(10000).optional(),
  procurementContact: z.string().max(200),
  lastReviewed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export const coachSchema = z.object({
  headline: z
    .string()
    .min(1)
    .max(140)
    .refine((v) => v.trim().split(/\s+/).length <= 12),
  assessment: z.string().min(1).max(1600),
  priorityActions: z.array(z.string().min(1).max(500)).length(3),
  watchouts: z.array(z.string().min(1).max(500)).length(2),
});
