import type { LegendItem, LineStyle, MaterialCategory, MaterialDefinition } from "../../types/blueprint";

export interface MaterialPreset extends MaterialDefinition {
  categoryLabel: string;
}

const createMaterialPreset = (
  id: string,
  name: string,
  category: MaterialCategory,
  hatchPattern: string,
  lineStyle: LineStyle,
  label: string,
  colorHint: string,
  categoryLabel: string,
): MaterialPreset => ({
  id,
  name,
  category,
  hatchPattern,
  lineStyle,
  label,
  colorHint,
  categoryLabel,
});

export const MATERIAL_PRESETS: Record<string, MaterialPreset> = {
  wall_drywall: createMaterialPreset(
    "wall_drywall",
    "Drywall",
    "wall",
    "diag-light",
    "solid",
    "DW",
    "#cfd6dd",
    "Walls",
  ),
  wall_brick: createMaterialPreset(
    "wall_brick",
    "Brick",
    "wall",
    "brick",
    "solid",
    "BRK",
    "#b86a4e",
    "Walls",
  ),
  floor_hardwood: createMaterialPreset(
    "floor_hardwood",
    "Hardwood",
    "floor",
    "wood",
    "solid",
    "HW",
    "#9b7b52",
    "Floors",
  ),
  floor_tile: createMaterialPreset(
    "floor_tile",
    "Tile",
    "floor",
    "grid",
    "solid",
    "TILE",
    "#9ea9b7",
    "Floors",
  ),
  roof_shingle: createMaterialPreset(
    "roof_shingle",
    "Shingle",
    "roof",
    "diag-tight",
    "dashed",
    "SH",
    "#5f6a74",
    "Roof",
  ),
  counter_quartz: createMaterialPreset(
    "counter_quartz",
    "Quartz",
    "counter",
    "dot",
    "solid",
    "QTZ",
    "#d7dce2",
    "Counters",
  ),
  fixture_generic: createMaterialPreset(
    "fixture_generic",
    "Fixture",
    "fixture",
    "solid",
    "solid",
    "FX",
    "#7f97ab",
    "Fixtures",
  ),
};

export const DEFAULT_MATERIAL_IDS = {
  wall: "wall_drywall",
  floor: "floor_hardwood",
  roof: "roof_shingle",
  counter: "counter_quartz",
  fixture: "fixture_generic",
} as const;

export const listMaterialPresets = (): MaterialPreset[] => {
  return Object.values(MATERIAL_PRESETS);
};

export const getMaterialPreset = (id: string): MaterialPreset => {
  return MATERIAL_PRESETS[id] ?? MATERIAL_PRESETS.fixture_generic;
};

export const mergeWithMaterialPresets = (materials: MaterialDefinition[]): MaterialDefinition[] => {
  if (materials.length === 0) {
    return listMaterialPresets();
  }

  const map = new Map<string, MaterialDefinition>();
  listMaterialPresets().forEach((preset) => map.set(preset.id, preset));
  materials.forEach((material) => map.set(material.id, material));
  return Array.from(map.values());
};

export const deriveMaterialLegendItems = (materials: MaterialDefinition[]): LegendItem[] => {
  return mergeWithMaterialPresets(materials).map((material, index) => ({
    id: "legend_material_" + index,
    category: "material",
    key: material.id,
    label: material.label,
    sample: material.hatchPattern,
  }));
};
