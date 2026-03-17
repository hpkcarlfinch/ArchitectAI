import { deriveMaterialLegendItems, mergeWithMaterialPresets } from "../../services/blueprint/materialRegistry";
import { getDoorSymbol, getFixtureSymbol, getWindowSymbol, type SymbolDefinition } from "../../services/blueprint/symbolRegistry";
import type { BlueprintSchema, FloorPlan } from "../../types/blueprint";

interface BlueprintLegendProps {
  blueprint: BlueprintSchema;
  floor: FloorPlan;
}

interface SymbolLegendItem {
  id: string;
  label: string;
  symbol: SymbolDefinition;
}

const SymbolSample = ({ item }: { item: SymbolLegendItem }) => {
  if (item.symbol.id.startsWith("door.")) {
    return (
      <svg className="legend-key-svg" viewBox="0 0 28 20" aria-hidden="true">
        <line x1={3} y1={10} x2={25} y2={10} stroke="#7fd6ff" strokeWidth={2} />
        <path d="M 3 10 L 16 2" stroke="#b7ecff" strokeWidth={1.4} fill="none" />
        <path d="M 3 10 A 13 13 0 0 1 16 2" stroke="#7fd6ff" strokeDasharray="2 2" strokeWidth={1.1} fill="none" />
      </svg>
    );
  }

  if (item.symbol.id.startsWith("window.")) {
    return (
      <svg className="legend-key-svg" viewBox="0 0 28 20" aria-hidden="true">
        <line x1={4} y1={10} x2={24} y2={10} stroke="#c6f2ff" strokeWidth={3} />
        <line x1={7} y1={7} x2={7} y2={13} stroke="#0f2737" strokeWidth={1} />
        <line x1={21} y1={7} x2={21} y2={13} stroke="#0f2737" strokeWidth={1} />
      </svg>
    );
  }

  if (item.symbol.id === "structure.column") {
    return (
      <svg className="legend-key-svg" viewBox="0 0 28 20" aria-hidden="true">
        <circle cx={14} cy={10} r={5} fill="#243849" stroke="#b7d4ea" strokeWidth={1.2} />
      </svg>
    );
  }

  return (
    <svg className="legend-key-svg" viewBox="0 0 28 20" aria-hidden="true">
      <rect x={5} y={4} width={18} height={12} rx={2} fill="#223140" stroke="#9ebdd6" strokeWidth={1.2} />
      <text x={14} y={12.2} textAnchor="middle" fontSize={5} fill="#d8eaf7">
        {item.label.slice(0, 3).toUpperCase()}
      </text>
    </svg>
  );
};

const collectSymbols = (floor: FloorPlan): SymbolLegendItem[] => {
  const symbolMap = new Map<string, SymbolLegendItem>();

  floor.doors.forEach((door) => {
    const symbol = getDoorSymbol(door.type);
    symbolMap.set(symbol.id, { id: symbol.id, label: symbol.label, symbol });
  });

  floor.windows.forEach((windowItem) => {
    const symbol = getWindowSymbol(windowItem.type);
    symbolMap.set(symbol.id, { id: symbol.id, label: symbol.label, symbol });
  });

  (floor.fixtures ?? []).forEach((fixture) => {
    const symbol = getFixtureSymbol(fixture.kind);
    symbolMap.set(symbol.id, { id: symbol.id, label: symbol.label, symbol });
  });

  return Array.from(symbolMap.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const collectMaterialIds = (blueprint: BlueprintSchema, floor: FloorPlan): Set<string> => {
  const ids = new Set<string>();

  floor.rooms.forEach((room) => {
    if (room.floorMaterial) {
      ids.add(room.floorMaterial);
    }
  });

  floor.walls.forEach((wall) => {
    if (wall.materialId) {
      ids.add(wall.materialId);
    }
  });

  floor.doors.forEach((door) => {
    if (door.materialId) {
      ids.add(door.materialId);
    }
  });

  floor.windows.forEach((windowItem) => {
    if (windowItem.materialId) {
      ids.add(windowItem.materialId);
    }
  });

  (floor.fixtures ?? []).forEach((fixture) => {
    if (fixture.materialId) {
      ids.add(fixture.materialId);
    }
  });

  (blueprint.roofZones ?? []).forEach((zone) => {
    if (zone.materialId) {
      ids.add(zone.materialId);
    }
  });

  return ids;
};

export const BlueprintLegend = ({ blueprint, floor }: BlueprintLegendProps) => {
  const explicitSymbolLegend = (blueprint.legends ?? [])
    .flatMap((legend) => legend.items)
    .filter((item) => item.category === "symbol")
    .map((item) => item.label);
  const explicitMaterialLegend = (blueprint.legends ?? [])
    .flatMap((legend) => legend.items)
    .filter((item) => item.category === "material");

  const symbols = collectSymbols(floor);
  const materialIds = collectMaterialIds(blueprint, floor);
  const allMaterials = mergeWithMaterialPresets(blueprint.materials ?? []);
  const usedMaterials = allMaterials.filter((material) => materialIds.has(material.id));
  const materialItems = deriveMaterialLegendItems(usedMaterials);

  return (
    <aside className="legend-panel" aria-label="Blueprint legend">
      <h3>Legend</h3>

      <div className="legend-group">
        <h4>Symbols</h4>
        {symbols.length === 0 && explicitSymbolLegend.length === 0 ? (
          <p className="muted small">No symbol entities yet.</p>
        ) : (
          <ul className="legend-list">
            {symbols.map((item) => (
              <li key={item.id}>
                <SymbolSample item={item} />
                <span>{item.label}</span>
              </li>
            ))}
            {symbols.length === 0
              ? explicitSymbolLegend.map((label) => (
                  <li key={`legend_symbol_${label}`}>
                    <span className="legend-pattern-chip" aria-hidden="true">
                      SYM
                    </span>
                    <span>{label}</span>
                  </li>
                ))
              : null}
          </ul>
        )}
      </div>

      <div className="legend-group">
        <h4>Materials</h4>
        {materialItems.length === 0 && explicitMaterialLegend.length === 0 ? (
          <p className="muted small">No material assignments yet.</p>
        ) : (
          <ul className="legend-list">
            {materialItems.map((item) => (
              <li key={item.id}>
                <span className="legend-pattern-chip" aria-hidden="true">
                  {item.sample ?? "-"}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
            {materialItems.length === 0
              ? explicitMaterialLegend.map((item) => (
                  <li key={item.id}>
                    <span className="legend-pattern-chip" aria-hidden="true">
                      {item.sample ?? "-"}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))
              : null}
          </ul>
        )}
      </div>
    </aside>
  );
};
