import type { DoorType, FixtureKind, WindowType } from "../../types/blueprint";

export type SymbolCategory = "opening" | "fixture" | "appliance" | "structure" | "furniture";

export interface SymbolDefinition {
  id: string;
  kind: string;
  label: string;
  category: SymbolCategory;
  defaultWidth: number;
  defaultHeight: number;
  has2D: boolean;
  has3D: boolean;
}

const fixtureDefinitions: Record<FixtureKind, SymbolDefinition> = {
  sink: {
    id: "fixture.sink",
    kind: "sink",
    label: "Sink",
    category: "fixture",
    defaultWidth: 0.9,
    defaultHeight: 0.6,
    has2D: true,
    has3D: true,
  },
  toilet: {
    id: "fixture.toilet",
    kind: "toilet",
    label: "Toilet",
    category: "fixture",
    defaultWidth: 0.7,
    defaultHeight: 0.8,
    has2D: true,
    has3D: false,
  },
  bathtub: {
    id: "fixture.bathtub",
    kind: "bathtub",
    label: "Bathtub",
    category: "fixture",
    defaultWidth: 1.7,
    defaultHeight: 0.8,
    has2D: true,
    has3D: true,
  },
  shower: {
    id: "fixture.shower",
    kind: "shower",
    label: "Shower",
    category: "fixture",
    defaultWidth: 0.9,
    defaultHeight: 0.9,
    has2D: true,
    has3D: true,
  },
  stove: {
    id: "appliance.stove",
    kind: "stove",
    label: "Stove",
    category: "appliance",
    defaultWidth: 0.9,
    defaultHeight: 0.7,
    has2D: true,
    has3D: true,
  },
  refrigerator: {
    id: "appliance.refrigerator",
    kind: "refrigerator",
    label: "Refrigerator",
    category: "appliance",
    defaultWidth: 0.9,
    defaultHeight: 0.8,
    has2D: true,
    has3D: true,
  },
  island: {
    id: "fixture.island",
    kind: "island",
    label: "Kitchen Island",
    category: "fixture",
    defaultWidth: 2,
    defaultHeight: 1,
    has2D: true,
    has3D: true,
  },
  cabinet: {
    id: "fixture.cabinet",
    kind: "cabinet",
    label: "Cabinet",
    category: "fixture",
    defaultWidth: 1,
    defaultHeight: 0.6,
    has2D: true,
    has3D: true,
  },
  washer: {
    id: "appliance.washer",
    kind: "washer",
    label: "Washer",
    category: "appliance",
    defaultWidth: 0.7,
    defaultHeight: 0.7,
    has2D: true,
    has3D: false,
  },
  dryer: {
    id: "appliance.dryer",
    kind: "dryer",
    label: "Dryer",
    category: "appliance",
    defaultWidth: 0.7,
    defaultHeight: 0.7,
    has2D: true,
    has3D: false,
  },
  stairs: {
    id: "structure.stairs",
    kind: "stairs",
    label: "Stairs",
    category: "structure",
    defaultWidth: 2.2,
    defaultHeight: 1,
    has2D: true,
    has3D: true,
  },
  column: {
    id: "structure.column",
    kind: "column",
    label: "Column",
    category: "structure",
    defaultWidth: 0.35,
    defaultHeight: 0.35,
    has2D: true,
    has3D: true,
  },
  closet: {
    id: "fixture.closet",
    kind: "closet",
    label: "Closet",
    category: "fixture",
    defaultWidth: 1.2,
    defaultHeight: 0.7,
    has2D: true,
    has3D: false,
  },
  bed: {
    id: "furniture.bed",
    kind: "bed",
    label: "Bed",
    category: "furniture",
    defaultWidth: 2,
    defaultHeight: 1.6,
    has2D: true,
    has3D: false,
  },
  sofa: {
    id: "furniture.sofa",
    kind: "sofa",
    label: "Sofa",
    category: "furniture",
    defaultWidth: 2,
    defaultHeight: 0.9,
    has2D: true,
    has3D: false,
  },
  table: {
    id: "furniture.table",
    kind: "table",
    label: "Table",
    category: "furniture",
    defaultWidth: 1.4,
    defaultHeight: 0.9,
    has2D: true,
    has3D: false,
  },
  vanity: {
    id: "fixture.vanity",
    kind: "vanity",
    label: "Vanity",
    category: "fixture",
    defaultWidth: 0.9,
    defaultHeight: 0.55,
    has2D: true,
    has3D: false,
  },
  dishwasher: {
    id: "appliance.dishwasher",
    kind: "dishwasher",
    label: "Dishwasher",
    category: "appliance",
    defaultWidth: 0.6,
    defaultHeight: 0.6,
    has2D: true,
    has3D: false,
  },
  generic: {
    id: "fixture.generic",
    kind: "generic",
    label: "Generic Fixture",
    category: "fixture",
    defaultWidth: 0.8,
    defaultHeight: 0.8,
    has2D: true,
    has3D: false,
  },
};

const doorDefinitions: Record<DoorType, SymbolDefinition> = {
  single: {
    id: "door.single",
    kind: "door.single",
    label: "Single Door",
    category: "opening",
    defaultWidth: 0.9,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
  double: {
    id: "door.double",
    kind: "door.double",
    label: "Double Door",
    category: "opening",
    defaultWidth: 1.6,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
  sliding: {
    id: "door.sliding",
    kind: "door.sliding",
    label: "Sliding Door",
    category: "opening",
    defaultWidth: 1.8,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
  pocket: {
    id: "door.pocket",
    kind: "door.pocket",
    label: "Pocket Door",
    category: "opening",
    defaultWidth: 0.85,
    defaultHeight: 0.2,
    has2D: true,
    has3D: false,
  },
  entry: {
    id: "door.entry",
    kind: "door.entry",
    label: "Entry Door",
    category: "opening",
    defaultWidth: 1.1,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
};

const windowDefinitions: Record<WindowType, SymbolDefinition> = {
  fixed: {
    id: "window.fixed",
    kind: "window.fixed",
    label: "Fixed Window",
    category: "opening",
    defaultWidth: 1.2,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
  casement: {
    id: "window.casement",
    kind: "window.casement",
    label: "Casement Window",
    category: "opening",
    defaultWidth: 1,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
  sliding: {
    id: "window.sliding",
    kind: "window.sliding",
    label: "Sliding Window",
    category: "opening",
    defaultWidth: 1.4,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
  picture: {
    id: "window.picture",
    kind: "window.picture",
    label: "Picture Window",
    category: "opening",
    defaultWidth: 1.8,
    defaultHeight: 0.2,
    has2D: true,
    has3D: true,
  },
  awning: {
    id: "window.awning",
    kind: "window.awning",
    label: "Awning Window",
    category: "opening",
    defaultWidth: 0.9,
    defaultHeight: 0.2,
    has2D: true,
    has3D: false,
  },
};

export const SYMBOL_REGISTRY: Record<string, SymbolDefinition> = {
  ...fixtureDefinitions,
  ...doorDefinitions,
  ...windowDefinitions,
};

export const getSymbolDefinition = (kindOrId: string): SymbolDefinition => {
  return SYMBOL_REGISTRY[kindOrId] ?? fixtureDefinitions.generic;
};

export const getFixtureSymbol = (kind: FixtureKind): SymbolDefinition => {
  return fixtureDefinitions[kind] ?? fixtureDefinitions.generic;
};

export const getDoorSymbol = (doorType: DoorType): SymbolDefinition => {
  return doorDefinitions[doorType] ?? doorDefinitions.single;
};

export const getWindowSymbol = (windowType: WindowType): SymbolDefinition => {
  return windowDefinitions[windowType] ?? windowDefinitions.fixed;
};

export const listSymbolsByCategory = (category: SymbolCategory): SymbolDefinition[] => {
  return Object.values(SYMBOL_REGISTRY).filter((symbol) => symbol.category === category);
};
