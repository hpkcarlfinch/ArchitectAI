import { z } from "zod";

const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const wallSchema = z.object({
  id: z.string(),
  start: pointSchema,
  end: pointSchema,
  thickness: z.number().min(0.05).max(1).default(0.2),
  type: z.enum(["exterior", "interior"]).default("interior"),
});

const doorSchema = z.object({
  id: z.string(),
  wallId: z.string(),
  offset: z.number().min(0),
  width: z.number().min(0.5).max(2),
  height: z.number().min(1.8).max(3),
});

const windowSchema = z.object({
  id: z.string(),
  wallId: z.string(),
  offset: z.number().min(0),
  width: z.number().min(0.4).max(4),
  sillHeight: z.number().min(0).max(2).default(0.9),
  height: z.number().min(0.4).max(3).default(1.2),
});

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string().optional(),
  polygon: z.array(pointSchema).min(3),
  areaSqM: z.number().positive().optional(),
  floorMaterial: z.string().optional(),
});

const floorPlanSchema = z.object({
  id: z.string(),
  level: z.number().int().nonnegative(),
  name: z.string(),
  ceilingHeight: z.number().min(2.2).max(5).default(2.8),
  rooms: z.array(roomSchema).min(1),
  walls: z.array(wallSchema).min(1),
  doors: z.array(doorSchema).default([]),
  windows: z.array(windowSchema).default([]),
});

export const blueprintSchema = z.object({
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    style: z.string().optional(),
    units: z.enum(["m", "ft"]).default("m"),
    lotWidth: z.number().positive().optional(),
    lotDepth: z.number().positive().optional(),
  }),
  floors: z.array(floorPlanSchema).min(1),
  roofHints: z.object({
    type: z.string().optional(),
    pitch: z.string().optional(),
  }).optional(),
  materialHints: z.object({
    wall: z.string().optional(),
    roof: z.string().optional(),
    floor: z.string().optional(),
  }).optional(),
});

export const aiEnvelopeSchema = z.object({
  status: z.enum(["blueprint_ready", "needs_clarification"]),
  assistantMessage: z.string(),
  blueprint: blueprintSchema.optional(),
});

export type BlueprintSchema = z.infer<typeof blueprintSchema>;
export type AIEnvelope = z.infer<typeof aiEnvelopeSchema>;
