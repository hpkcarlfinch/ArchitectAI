import { useMemo } from "react";
import { EmptyState } from "../../components/EmptyState";
import { BlueprintLegend } from "../blueprint/BlueprintLegend";
import {
  createViewportTransform,
  renderAnnotationsLayer,
  renderFixturesLayer,
  renderOpeningsLayer,
  renderPatternDefs,
  renderRoomsLayer,
  renderWallsLayer,
} from "./blueprint2dHelpers";
import type { BlueprintSchema, FloorPlan } from "../../types/blueprint";

interface Blueprint2DViewProps {
  blueprint: BlueprintSchema | null;
}

const renderFloor = (blueprint: BlueprintSchema, floor: FloorPlan) => {
  const transform = createViewportTransform(floor);

  return (
    <svg viewBox={`0 0 ${transform.width} ${transform.height}`} className="blueprint-svg" role="img" aria-label="2D floor plan">
      <rect x={0} y={0} width={transform.width} height={transform.height} fill="#101820" />
      {renderPatternDefs(blueprint)}

      {renderRoomsLayer(floor, blueprint, transform)}
      {renderWallsLayer(floor, transform)}
      {renderOpeningsLayer(floor, transform)}
      {renderFixturesLayer(floor, transform)}
      {renderAnnotationsLayer(floor, blueprint, transform)}
    </svg>
  );
};

export const Blueprint2DView = ({ blueprint }: Blueprint2DViewProps) => {
  const floor = useMemo(() => blueprint?.floors[0] ?? null, [blueprint]);

  if (!blueprint || !floor) {
    return (
      <EmptyState
        title="No blueprint yet"
        description="Ask the AI architect to generate a plan, then it will appear here in 2D."
      />
    );
  }

  return (
    <div className="render-2d-layout">
      <div className="render-surface">{renderFloor(blueprint, floor)}</div>
      <BlueprintLegend blueprint={blueprint} floor={floor} />
    </div>
  );
};
