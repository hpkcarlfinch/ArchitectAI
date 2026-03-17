import { z } from "zod";

const metadataValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const lineStyleSchema = z.enum(["solid", "dashed", "dotted"]);

const doorSwingSchema = z.enum(["left", "right", "double", "sliding", "none"]);

const doorTypeSchema = z.enum(["single", "double", "sliding", "pocket", "entry"]);

const windowTypeSchema = z.enum(["fixed", "casement", "sliding", "picture", "awning"]);

const fixtureKindSchema = z.enum([
  "sink",
  "toilet",
  "bathtub",
  "shower",
  "stove",
  "refrigerator",
  "island",
  "cabinet",
  "washer",
  "dryer",
  "stairs",
  "column",
  "closet",
  "bed",
  "sofa",
  "table",
  "vanity",
  "dishwasher",
  "generic",
]);

const annotationKindSchema = z.enum(["label", "dimension", "materialTag", "elevationMarker", "sectionMarker", "note"]);

const materialCategorySchema = z.enum(["wall", "floor", "roof", "counter", "fixture", "generic"]);

const wallSchema = z.object({
  id: z.string(),
  start: pointSchema,
  end: pointSchema,
  thickness: z.number().min(0.05).max(1),
  type: z.enum(["exterior", "interior"]),
  materialId: z.string().optional(),
});

const doorSchema = z.object({
  id: z.string(),
  wallId: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0.5).max(2),
  swing: doorSwingSchema,
  rotation: z.number(),
  type: doorTypeSchema,
  materialId: z.string().optional(),
  metadata: z.record(z.string(), metadataValueSchema).optional(),
  offset: z.number().min(0).optional(),
  height: z.number().min(1.8).max(3).optional(),
});

const windowSchema = z.object({
  id: z.string(),
  wallId: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0.4).max(4),
  height: z.number().min(0.4).max(3),
  rotation: z.number(),
  type: windowTypeSchema,
  materialId: z.string().optional(),
  metadata: z.record(z.string(), metadataValueSchema).optional(),
  offset: z.number().min(0).optional(),
  sillHeight: z.number().min(0).max(2).optional(),
});

const fixtureSchema = z.object({
  id: z.string(),
  kind: fixtureKindSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().min(0.2),
  height: z.number().min(0.2),
  rotation: z.number(),
  roomId: z.string().optional(),
  symbol: z.string().optional(),
  materialId: z.string().optional(),
  metadata: z.record(z.string(), metadataValueSchema).optional(),
});

const annotationSchema = z.object({
  id: z.string(),
  kind: annotationKindSchema,
  x: z.number(),
  y: z.number(),
  text: z.string(),
  targetId: z.string().optional(),
  rotation: z.number().optional(),
});

const materialSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: materialCategorySchema,
  hatchPattern: z.string(),
  lineStyle: lineStyleSchema,
  label: z.string(),
  colorHint: z.string().optional(),
});

const roofZoneSchema = z.object({
  id: z.string(),
  level: z.number().optional(),
  polygon: z.array(pointSchema),
  materialId: z.string().optional(),
  label: z.string().optional(),
});

const legendItemSchema = z.object({
  id: z.string(),
  category: z.enum(["symbol", "material"]),
  key: z.string(),
  label: z.string(),
  sample: z.string().optional(),
});

const legendSchema = z.object({
  title: z.string().optional(),
  items: z.array(legendItemSchema).default([]),
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
  doors: z.array(doorSchema).default([]),
  windows: z.array(windowSchema).default([]),
  fixtures: z.array(fixtureSchema).default([]),
  annotations: z.array(annotationSchema).default([]),
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
  materials: z.array(materialSchema).default([]),
  annotations: z.array(annotationSchema).default([]),
  roofZones: z.array(roofZoneSchema).default([]),
  legends: z.array(legendSchema).default([]),
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
