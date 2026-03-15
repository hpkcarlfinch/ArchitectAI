export type RenderMode = "2d" | "3d";

export interface Point2D {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;
  type: "exterior" | "interior";
}

export interface Door {
  id: string;
  wallId: string;
  offset: number;
  width: number;
  height: number;
}

export interface Window {
  id: string;
  wallId: string;
  offset: number;
  width: number;
  sillHeight: number;
  height: number;
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
