import type { FixtureKind, FloorPlan } from "../../types/blueprint";

export interface OpeningPlacement {
  id: string;
  x: number;
  z: number;
  width: number;
  height: number;
  y: number;
  rotation: number;
  kind: "door" | "window";
}

export interface FixturePlacement {
  id: string;
  kind: FixtureKind;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
}

const supportsFixture3D = (kind: FixtureKind): boolean => {
  return [
    "island",
    "cabinet",
    "bathtub",
    "shower",
    "stairs",
    "refrigerator",
    "stove",
    "sink",
    "toilet",
  ].includes(kind);
};

const safeNumber = (value: number, fallback: number): number => {
  return Number.isFinite(value) ? value : fallback;
};

const positive = (value: number, fallback: number, min: number): number => {
  const resolved = safeNumber(value, fallback);
  return Math.max(min, resolved);
};

const fixtureHeight = (kind: FixtureKind): number => {
  switch (kind) {
    case "island":
    case "cabinet":
      return 0.95;
    case "bathtub":
      return 0.6;
    case "shower":
      return 2.1;
    case "stairs":
      return 1.5;
    case "refrigerator":
      return 1.95;
    case "stove":
      return 0.95;
    case "sink":
      return 0.95;
    case "toilet":
      return 0.85;
    default:
      return 0.8;
  }
};

export const rotationToRadians = (rotation: number): number => {
  const resolved = safeNumber(rotation, 0);
  if (Math.abs(resolved) <= Math.PI * 2) {
    return resolved;
  }
  return (resolved * Math.PI) / 180;
};

export const createDoorPlacements = (floor: FloorPlan): OpeningPlacement[] => {
  return floor.doors.map((door) => {
    const height = positive(door.height ?? 2.1, 2.1, 1.8);
    return {
      id: door.id,
      x: safeNumber(door.x, 0),
      z: safeNumber(door.y, 0),
      width: positive(door.width, 0.9, 0.5),
      height,
      y: height / 2,
      rotation: rotationToRadians(door.rotation),
      kind: "door",
    };
  });
};

export const createWindowPlacements = (floor: FloorPlan): OpeningPlacement[] => {
  return floor.windows.map((windowItem) => {
    const sillHeight = positive(windowItem.sillHeight ?? 0.9, 0.9, 0);
    const height = positive(windowItem.height, 1.2, 0.4);
    return {
      id: windowItem.id,
      x: safeNumber(windowItem.x, 0),
      z: safeNumber(windowItem.y, 0),
      width: positive(windowItem.width, 1.2, 0.4),
      height,
      y: sillHeight + height / 2,
      rotation: rotationToRadians(windowItem.rotation),
      kind: "window",
    };
  });
};

export const createFixturePlacements = (floor: FloorPlan): FixturePlacement[] => {
  return (floor.fixtures ?? [])
    .filter((fixture) => supportsFixture3D(fixture.kind))
    .map((fixture) => ({
      id: fixture.id,
      kind: fixture.kind,
      x: safeNumber(fixture.x, 0),
      z: safeNumber(fixture.y, 0),
      width: positive(fixture.width, 0.9, 0.25),
      depth: positive(fixture.height, 0.9, 0.25),
      height: fixtureHeight(fixture.kind),
      rotation: rotationToRadians(fixture.rotation),
    }));
};

export const stairStepsCount = (fixture: FixturePlacement): number => {
  if (fixture.kind !== "stairs") {
    return 0;
  }
  return Math.max(4, Math.min(12, Math.round(fixture.depth / 0.22)));
};
