import { z } from "zod";

const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const wallSchema = z.object({
  id: z.string(),
  start: pointSchema,
  end: pointSchema,
  thickness: z.number().min(0.05).max(1),
  type: z.enum(["exterior", "interior"]),
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
  sillHeight: z.number().min(0).max(2),
  height: z.number().min(0.4).max(3),
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
  ceilingHeight: z.number().min(2.2).max(5),
  rooms: z.array(roomSchema).min(1),
  walls: z.array(wallSchema).min(1),
  doors: z.array(doorSchema),
  windows: z.array(windowSchema),
});

export const blueprintSchema = z.object({
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    style: z.string().optional(),
    units: z.enum(["m", "ft"]),
    lotWidth: z.number().positive().optional(),
    lotDepth: z.number().positive().optional(),
  }),
  floors: z.array(floorPlanSchema).min(1),
  roofHints: z
    .object({
      type: z.string().optional(),
      pitch: z.string().optional(),
    })
    .optional(),
  materialHints: z
    .object({
      wall: z.string().optional(),
      roof: z.string().optional(),
      floor: z.string().optional(),
    })
    .optional(),
});

export type BlueprintSchemaParsed = z.infer<typeof blueprintSchema>;
