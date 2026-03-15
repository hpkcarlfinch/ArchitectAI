import { useMemo } from "react";
import { EmptyState } from "../../components/EmptyState";
import { centroid, getFloorBounds, wallLength } from "../../services/blueprint/geometry";
import type { BlueprintSchema, FloorPlan, Point2D } from "../../types/blueprint";

interface Blueprint2DViewProps {
  blueprint: BlueprintSchema | null;
}

const toPath = (polygon: Point2D[], scale: number, offsetX: number, offsetY: number): string => {
  return polygon
    .map((point, index) => {
      const x = point.x * scale + offsetX;
      const y = point.y * scale + offsetY;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .concat("Z")
    .join(" ");
};

const renderFloor = (floor: FloorPlan) => {
  const width = 920;
  const height = 680;
  const padding = 40;

  const bounds = getFloorBounds(floor);
  const scale = Math.min((width - padding * 2) / bounds.width, (height - padding * 2) / bounds.height);

  const offsetX = padding - bounds.minX * scale;
  const offsetY = padding - bounds.minY * scale;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="blueprint-svg" role="img" aria-label="2D floor plan">
      <rect x={0} y={0} width={width} height={height} fill="#101820" />

      {floor.rooms.map((room) => {
        const center = centroid(room.polygon);
        return (
          <g key={room.id}>
            <path d={toPath(room.polygon, scale, offsetX, offsetY)} fill="#1f2d3b" stroke="#5d7b95" strokeWidth={1.2} />
            <text
              x={center.x * scale + offsetX}
              y={center.y * scale + offsetY}
              textAnchor="middle"
              fontSize={12}
              fill="#d9e9f7"
            >
              {room.label || room.name}
            </text>
          </g>
        );
      })}

      {floor.walls.map((wall) => (
        <g key={wall.id}>
          <line
            x1={wall.start.x * scale + offsetX}
            y1={wall.start.y * scale + offsetY}
            x2={wall.end.x * scale + offsetX}
            y2={wall.end.y * scale + offsetY}
            stroke={wall.type === "exterior" ? "#f5f7fa" : "#a6c2db"}
            strokeWidth={Math.max(2, wall.thickness * scale * 0.3)}
          />
          <text
            x={((wall.start.x + wall.end.x) * 0.5) * scale + offsetX}
            y={((wall.start.y + wall.end.y) * 0.5) * scale + offsetY - 4}
            textAnchor="middle"
            fontSize={10}
            fill="#8fb2ce"
          >
            {`${wallLength(wall).toFixed(1)}m`}
          </text>
        </g>
      ))}
    </svg>
  );
};

export const Blueprint2DView = ({ blueprint }: Blueprint2DViewProps) => {
  const floor = useMemo(() => blueprint?.floors[0] ?? null, [blueprint]);

  if (!floor) {
    return (
      <EmptyState
        title="No blueprint yet"
        description="Ask the AI architect to generate a plan, then it will appear here in 2D."
      />
    );
  }

  return <div className="render-surface">{renderFloor(floor)}</div>;
};
