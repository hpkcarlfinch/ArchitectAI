export type RenderMode = "2d" | "3d";

export interface Point2D {
  x: number;
  y: number;
}

export type LineStyle = "solid" | "dashed" | "dotted";

export type DoorSwing = "left" | "right" | "double" | "sliding" | "none";

export type DoorType = "single" | "double" | "sliding" | "pocket" | "entry";

export type WindowType = "fixed" | "casement" | "sliding" | "picture" | "awning";

export type FixtureKind =
  | "sink"
  | "toilet"
  | "bathtub"
  | "shower"
  | "stove"
  | "refrigerator"
  | "island"
  | "cabinet"
  | "washer"
  | "dryer"
  | "stairs"
  | "column"
  | "closet"
  | "bed"
  | "sofa"
  | "table"
  | "vanity"
  | "dishwasher"
  | "generic";

export type MaterialCategory = "wall" | "floor" | "roof" | "counter" | "fixture" | "generic";

export type AnnotationKind = "label" | "dimension" | "materialTag" | "elevationMarker" | "sectionMarker" | "note";

export interface MaterialDefinition {
  id: string;
  name: string;
  category: MaterialCategory;
  hatchPattern: string;
  lineStyle: LineStyle;
  label: string;
  colorHint?: string;
}

export interface RoofZone {
  id: string;
  level?: number;
  polygon: Point2D[];
  materialId?: string;
  label?: string;
}

export interface Fixture {
  id: string;
  kind: FixtureKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  roomId?: string;
  symbol?: string;
  materialId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface Annotation {
  id: string;
  kind: AnnotationKind;
  x: number;
  y: number;
  text: string;
  targetId?: string;
  rotation?: number;
}

export interface LegendItem {
  id: string;
  category: "symbol" | "material";
  key: string;
  label: string;
  sample?: string;
}

export interface LegendDefinition {
  title?: string;
  items: LegendItem[];
}

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;
  type: "exterior" | "interior";
  materialId?: string;
}

export interface Door {
  id: string;
  wallId?: string;
  x: number;
  y: number;
  width: number;
  swing: DoorSwing;
  rotation: number;
  type: DoorType;
  materialId?: string;
  metadata?: Record<string, string | number | boolean | null>;

  // Backward-compatible fields present in older generated data.
  offset?: number;
  height?: number;
}

export interface Window {
  id: string;
  wallId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  type: WindowType;
  materialId?: string;
  metadata?: Record<string, string | number | boolean | null>;

  // Backward-compatible fields present in older generated data.
  offset?: number;
  sillHeight?: number;
}

export interface Room {
  id: string;
  name: string;
  label?: string;
  polygon: Point2D[];
  areaSqM?: number;
  floorMaterial?: string;
}

export interface FloorPlan {
  id: string;
  level: number;
  name: string;
  ceilingHeight: number;
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  fixtures?: Fixture[];
  annotations?: Annotation[];
}

export interface BlueprintMetadata {
  title: string;
  description: string;
  style?: string;
  units: "m" | "ft";
  lotWidth?: number;
  lotDepth?: number;
}

export interface BlueprintSchema {
  metadata: BlueprintMetadata;
  floors: FloorPlan[];
  materials?: MaterialDefinition[];
  annotations?: Annotation[];
  roofZones?: RoofZone[];
  legends?: LegendDefinition[];
  roofHints?: {
    type?: string;
    pitch?: string;
  };
  materialHints?: {
    wall?: string;
    roof?: string;
    floor?: string;
  };
}
