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
  thickness: z.number().min(0.05).max(1).default(0.2),
  type: z.enum(["exterior", "interior"]).default("interior"),
  materialId: z.string().optional(),
});

const doorSchema = z.object({
  id: z.string(),
  wallId: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0.5).max(2.5),
  swing: doorSwingSchema.default("left"),
  rotation: z.number().default(0),
  type: doorTypeSchema.default("single"),
  materialId: z.string().optional(),
  metadata: z.record(z.string(), metadataValueSchema).optional(),
  offset: z.number().min(0).optional(),
  height: z.number().min(1.8).max(3.2).optional(),
});

const windowSchema = z.object({
  id: z.string(),
  wallId: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(0.4).max(4.5),
  height: z.number().min(0.4).max(3),
  rotation: z.number().default(0),
  type: windowTypeSchema.default("fixed"),
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
  rotation: z.number().default(0),
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
  lineStyle: lineStyleSchema.default("solid"),
  label: z.string(),
  colorHint: z.string().optional(),
});

const roofZoneSchema = z.object({
  id: z.string(),
  level: z.number().optional(),
  polygon: z.array(pointSchema).default([]),
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
  ceilingHeight: z.number().min(2.2).max(5).default(2.8),
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
    units: z.enum(["m", "ft"]).default("m"),
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

export const aiEnvelopeSchema = z.object({
  status: z.enum(["blueprint_ready", "needs_clarification"]),
  assistantMessage: z.string(),
  blueprint: blueprintSchema.optional(),
});

export type BlueprintSchema = z.infer<typeof blueprintSchema>;
export type AIEnvelope = z.infer<typeof aiEnvelopeSchema>;

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const pickEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
};

const toMetadata = (value: unknown): Record<string, string | number | boolean | null> | undefined => {
  const source = asRecord(value);
  const entries = Object.entries(source).filter(([, candidate]) => {
    return (
      typeof candidate === "string" ||
      typeof candidate === "number" ||
      typeof candidate === "boolean" ||
      candidate === null
    );
  });
  return entries.length > 0
    ? (Object.fromEntries(entries) as Record<string, string | number | boolean | null>)
    : undefined;
};

const pointFromLegacyOffset = (
  wallId: string | undefined,
  offset: number,
  walls: Array<{ id: string; start: { x: number; y: number }; end: { x: number; y: number } }>,
): { x: number; y: number } => {
  if (!wallId) {
    return { x: 0, y: 0 };
  }

  const wall = walls.find((item) => item.id === wallId);
  if (!wall) {
    return { x: 0, y: 0 };
  }

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 0.0001) {
    return { x: wall.start.x, y: wall.start.y };
  }

  const t = Math.max(0, Math.min(offset, length)) / length;
  return {
    x: wall.start.x + dx * t,
    y: wall.start.y + dy * t,
  };
};

const normalizeBlueprint = (input: unknown): unknown => {
  const source = asRecord(input);
  const floors = Array.isArray(source.floors) ? source.floors : [];

  const normalizedFloors = floors.map((floorValue, floorIndex) => {
    const floor = asRecord(floorValue);
    const walls = (Array.isArray(floor.walls) ? floor.walls : []).map((wallValue, wallIndex) => {
      const wall = asRecord(wallValue);
      return {
        id: asString(wall.id, `wall_${floorIndex}_${wallIndex}`),
        start: {
          x: asNumber(asRecord(wall.start).x, 0),
          y: asNumber(asRecord(wall.start).y, 0),
        },
        end: {
          x: asNumber(asRecord(wall.end).x, 1),
          y: asNumber(asRecord(wall.end).y, 0),
        },
        thickness: Math.max(0.05, asNumber(wall.thickness, 0.2)),
        type: wall.type === "interior" ? "interior" : "exterior",
        materialId: asString(wall.materialId) || undefined,
      };
    });

    const doors = (Array.isArray(floor.doors) ? floor.doors : []).map((doorValue, doorIndex) => {
      const door = asRecord(doorValue);
      const wallId = asString(door.wallId) || undefined;
      const offset = asNumber(door.offset, 0);
      const legacyPoint = pointFromLegacyOffset(wallId, offset, walls);
      return {
        id: asString(door.id, `door_${floorIndex}_${doorIndex}`),
        wallId,
        x: asNumber(door.x, legacyPoint.x),
        y: asNumber(door.y, legacyPoint.y),
        width: Math.max(0.5, asNumber(door.width, 0.9)),
        swing: pickEnum(door.swing, ["left", "right", "double", "sliding", "none"], "left"),
        rotation: asNumber(door.rotation, 0),
        type: pickEnum(door.type, ["single", "double", "sliding", "pocket", "entry"], "single"),
        materialId: asString(door.materialId) || undefined,
        metadata: toMetadata(door.metadata),
        offset: typeof door.offset === "number" ? door.offset : undefined,
        height: typeof door.height === "number" ? door.height : undefined,
      };
    });

    const windows = (Array.isArray(floor.windows) ? floor.windows : []).map((windowValue, windowIndex) => {
      const windowData = asRecord(windowValue);
      const wallId = asString(windowData.wallId) || undefined;
      const offset = asNumber(windowData.offset, 0);
      const legacyPoint = pointFromLegacyOffset(wallId, offset, walls);
      return {
        id: asString(windowData.id, `window_${floorIndex}_${windowIndex}`),
        wallId,
        x: asNumber(windowData.x, legacyPoint.x),
        y: asNumber(windowData.y, legacyPoint.y),
        width: Math.max(0.4, asNumber(windowData.width, 1.2)),
        height: Math.max(0.4, asNumber(windowData.height, 1.2)),
        rotation: asNumber(windowData.rotation, 0),
        type: pickEnum(windowData.type, ["fixed", "casement", "sliding", "picture", "awning"], "fixed"),
        materialId: asString(windowData.materialId) || undefined,
        metadata: toMetadata(windowData.metadata),
        offset: typeof windowData.offset === "number" ? windowData.offset : undefined,
        sillHeight: typeof windowData.sillHeight === "number" ? windowData.sillHeight : undefined,
      };
    });

    return {
      id: asString(floor.id, `floor_${floorIndex}`),
      level: Math.max(0, Math.round(asNumber(floor.level, floorIndex))),
      name: asString(floor.name, floorIndex === 0 ? "Ground Floor" : `Floor ${floorIndex}`),
      ceilingHeight: Math.max(2.2, asNumber(floor.ceilingHeight, 2.8)),
      rooms: (Array.isArray(floor.rooms) ? floor.rooms : []).map((roomValue, roomIndex) => {
        const room = asRecord(roomValue);
        const polygon = (Array.isArray(room.polygon) ? room.polygon : []).map((pointValue) => {
          const point = asRecord(pointValue);
          return {
            x: asNumber(point.x, 0),
            y: asNumber(point.y, 0),
          };
        });

        const safePolygon =
          polygon.length >= 3
            ? polygon
            : [
                { x: 0, y: 0 },
                { x: 4, y: 0 },
                { x: 4, y: 3 },
                { x: 0, y: 3 },
              ];

        return {
          id: asString(room.id, `room_${floorIndex}_${roomIndex}`),
          name: asString(room.name, `Room ${roomIndex + 1}`),
          label: asString(room.label) || undefined,
          polygon: safePolygon,
          areaSqM: typeof room.areaSqM === "number" ? room.areaSqM : undefined,
          floorMaterial: asString(room.floorMaterial) || undefined,
        };
      }),
      walls,
      doors,
      windows,
      fixtures: (Array.isArray(floor.fixtures) ? floor.fixtures : []).map((fixtureValue, fixtureIndex) => {
        const fixture = asRecord(fixtureValue);
        return {
          id: asString(fixture.id, `fixture_${floorIndex}_${fixtureIndex}`),
          kind: pickEnum(
            fixture.kind,
            [
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
            ],
            "generic",
          ),
          x: asNumber(fixture.x, 0),
          y: asNumber(fixture.y, 0),
          width: Math.max(0.2, asNumber(fixture.width, 0.9)),
          height: Math.max(0.2, asNumber(fixture.height, 0.9)),
          rotation: asNumber(fixture.rotation, 0),
          roomId: asString(fixture.roomId) || undefined,
          symbol: asString(fixture.symbol) || undefined,
          materialId: asString(fixture.materialId) || undefined,
          metadata: toMetadata(fixture.metadata),
        };
      }),
      annotations: (Array.isArray(floor.annotations) ? floor.annotations : []).map((annotationValue, annotationIndex) => {
        const annotation = asRecord(annotationValue);
        return {
          id: asString(annotation.id, `ann_floor_${floorIndex}_${annotationIndex}`),
          kind: pickEnum(
            annotation.kind,
            ["label", "dimension", "materialTag", "elevationMarker", "sectionMarker", "note"],
            "note",
          ),
          x: asNumber(annotation.x, 0),
          y: asNumber(annotation.y, 0),
          text: asString(annotation.text, ""),
          targetId: asString(annotation.targetId) || undefined,
          rotation: typeof annotation.rotation === "number" ? annotation.rotation : undefined,
        };
      }),
    };
  });

  return {
    metadata: {
      title: asString(asRecord(source.metadata).title, "Generated Blueprint"),
      description: asString(asRecord(source.metadata).description, "Blueprint generated by AI assistant."),
      style: asString(asRecord(source.metadata).style) || undefined,
      units: pickEnum(asRecord(source.metadata).units, ["m", "ft"], "m"),
      lotWidth: typeof asRecord(source.metadata).lotWidth === "number" ? asRecord(source.metadata).lotWidth : undefined,
      lotDepth: typeof asRecord(source.metadata).lotDepth === "number" ? asRecord(source.metadata).lotDepth : undefined,
    },
    floors:
      normalizedFloors.length > 0
        ? normalizedFloors
        : [
            {
              id: "floor_0",
              level: 0,
              name: "Ground Floor",
              ceilingHeight: 2.8,
              rooms: [
                {
                  id: "room_0",
                  name: "Room 1",
                  polygon: [
                    { x: 0, y: 0 },
                    { x: 4, y: 0 },
                    { x: 4, y: 3 },
                    { x: 0, y: 3 },
                  ],
                },
              ],
              walls: [
                { id: "wall_0", start: { x: 0, y: 0 }, end: { x: 4, y: 0 }, thickness: 0.2, type: "exterior" },
              ],
              doors: [],
              windows: [],
              fixtures: [],
              annotations: [],
            },
          ],
    materials: (Array.isArray(source.materials) ? source.materials : []).map((materialValue, index) => {
      const material = asRecord(materialValue);
      return {
        id: asString(material.id, `material_${index}`),
        name: asString(material.name, `Material ${index + 1}`),
        category: pickEnum(material.category, ["wall", "floor", "roof", "counter", "fixture", "generic"], "generic"),
        hatchPattern: asString(material.hatchPattern, "solid"),
        lineStyle: pickEnum(material.lineStyle, ["solid", "dashed", "dotted"], "solid"),
        label: asString(material.label, asString(material.name, `Material ${index + 1}`)),
        colorHint: asString(material.colorHint) || undefined,
      };
    }),
    annotations: (Array.isArray(source.annotations) ? source.annotations : []).map((annotationValue, index) => {
      const annotation = asRecord(annotationValue);
      return {
        id: asString(annotation.id, `ann_root_${index}`),
        kind: pickEnum(annotation.kind, ["label", "dimension", "materialTag", "elevationMarker", "sectionMarker", "note"], "note"),
        x: asNumber(annotation.x, 0),
        y: asNumber(annotation.y, 0),
        text: asString(annotation.text, ""),
        targetId: asString(annotation.targetId) || undefined,
        rotation: typeof annotation.rotation === "number" ? annotation.rotation : undefined,
      };
    }),
    roofZones: (Array.isArray(source.roofZones) ? source.roofZones : []).map((roofZoneValue, index) => {
      const roofZone = asRecord(roofZoneValue);
      return {
        id: asString(roofZone.id, `roof_zone_${index}`),
        level: typeof roofZone.level === "number" ? roofZone.level : undefined,
        polygon: (Array.isArray(roofZone.polygon) ? roofZone.polygon : []).map((pointValue) => {
          const point = asRecord(pointValue);
          return { x: asNumber(point.x, 0), y: asNumber(point.y, 0) };
        }),
        materialId: asString(roofZone.materialId) || undefined,
        label: asString(roofZone.label) || undefined,
      };
    }),
    legends: (Array.isArray(source.legends) ? source.legends : []).map((legendValue, legendIndex) => {
      const legend = asRecord(legendValue);
      return {
        title: asString(legend.title) || undefined,
        items: (Array.isArray(legend.items) ? legend.items : []).map((itemValue, itemIndex) => {
          const item = asRecord(itemValue);
          return {
            id: asString(item.id, `legend_item_${legendIndex}_${itemIndex}`),
            category: item.category === "material" ? "material" : "symbol",
            key: asString(item.key, `item_${itemIndex}`),
            label: asString(item.label, `Item ${itemIndex + 1}`),
            sample: asString(item.sample) || undefined,
          };
        }),
      };
    }),
    roofHints: {
      type: asString(asRecord(source.roofHints).type) || undefined,
      pitch: asString(asRecord(source.roofHints).pitch) || undefined,
    },
    materialHints: {
      wall: asString(asRecord(source.materialHints).wall) || undefined,
      roof: asString(asRecord(source.materialHints).roof) || undefined,
      floor: asString(asRecord(source.materialHints).floor) || undefined,
    },
  };
};

export const parseAndNormalizeBlueprint = (input: unknown): BlueprintSchema => {
  return blueprintSchema.parse(normalizeBlueprint(input));
};

export const parseAndNormalizeAIEnvelope = (input: unknown): AIEnvelope => {
  const source = asRecord(input);
  const status = source.status === "blueprint_ready" ? "blueprint_ready" : "needs_clarification";
  const assistantMessage = asString(source.assistantMessage, "I need one more detail before generating the blueprint.");

  if (status === "blueprint_ready") {
    const blueprintCandidate = source.blueprint;
    if (!blueprintCandidate) {
      throw new Error("Blueprint payload is required when status is blueprint_ready.");
    }

    return aiEnvelopeSchema.parse({
      status,
      assistantMessage,
      blueprint: parseAndNormalizeBlueprint(blueprintCandidate),
    });
  }

  return aiEnvelopeSchema.parse({
    status,
    assistantMessage,
  });
};
