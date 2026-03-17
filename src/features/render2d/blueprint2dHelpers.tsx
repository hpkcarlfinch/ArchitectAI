import { centroid, getFloorBounds, wallLength } from "../../services/blueprint/geometry";
import { getDoorSymbol, getFixtureSymbol, getWindowSymbol } from "../../services/blueprint/symbolRegistry";
import type { BlueprintSchema, Door, Fixture, FloorPlan, MaterialDefinition, Point2D, Window } from "../../types/blueprint";

export interface ViewportTransform {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

const safeNumber = (value: number, fallback: number): number => {
  return Number.isFinite(value) ? value : fallback;
};

export const createViewportTransform = (floor: FloorPlan, width = 920, height = 680, padding = 40): ViewportTransform => {
  const bounds = getFloorBounds(floor);
  const rawScale = Math.min((width - padding * 2) / bounds.width, (height - padding * 2) / bounds.height);
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;

  return {
    width,
    height,
    scale,
    offsetX: padding - bounds.minX * scale,
    offsetY: padding - bounds.minY * scale,
  };
};

export const toPath = (polygon: Point2D[], transform: ViewportTransform): string => {
  return polygon
    .map((point, index) => {
      const x = point.x * transform.scale + transform.offsetX;
      const y = point.y * transform.scale + transform.offsetY;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .concat("Z")
    .join(" ");
};

const toScreen = (x: number, y: number, transform: ViewportTransform): Point2D => ({
  x: safeNumber(x, 0) * transform.scale + transform.offsetX,
  y: safeNumber(y, 0) * transform.scale + transform.offsetY,
});

const toDegrees = (rotation: number): number => {
  if (Math.abs(rotation) <= Math.PI * 2) {
    return (rotation * 180) / Math.PI;
  }
  return rotation;
};

const patternId = (materialId: string): string => {
  return `pattern_${materialId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
};

const renderMaterialPattern = (material: MaterialDefinition) => {
  const id = patternId(material.id);
  const color = material.colorHint ?? "#2f4457";

  if (material.hatchPattern.includes("grid")) {
    return (
      <pattern key={id} id={id} width={8} height={8} patternUnits="userSpaceOnUse">
        <rect width={8} height={8} fill="#1b2b39" />
        <path d="M 8 0 L 0 0 0 8" fill="none" stroke={color} strokeWidth={0.9} />
      </pattern>
    );
  }

  if (material.hatchPattern.includes("dot")) {
    return (
      <pattern key={id} id={id} width={8} height={8} patternUnits="userSpaceOnUse">
        <rect width={8} height={8} fill="#1b2b39" />
        <circle cx={2} cy={2} r={0.9} fill={color} />
        <circle cx={6} cy={6} r={0.9} fill={color} />
      </pattern>
    );
  }

  if (material.hatchPattern.includes("brick")) {
    return (
      <pattern key={id} id={id} width={14} height={8} patternUnits="userSpaceOnUse">
        <rect width={14} height={8} fill="#1b2b39" />
        <path d="M0 0 H14 M0 4 H14 M7 0 V4 M0 4 V8 M14 4 V8" stroke={color} strokeWidth={0.7} fill="none" />
      </pattern>
    );
  }

  if (material.hatchPattern.includes("wood")) {
    return (
      <pattern key={id} id={id} width={10} height={10} patternUnits="userSpaceOnUse">
        <rect width={10} height={10} fill="#1b2b39" />
        <path d="M0 2 C3 1 7 3 10 2 M0 6 C3 5 7 7 10 6" stroke={color} strokeWidth={0.8} fill="none" />
      </pattern>
    );
  }

  return (
    <pattern key={id} id={id} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={8} height={8} fill="#1b2b39" />
      <line x1={0} y1={0} x2={0} y2={8} stroke={color} strokeWidth={material.hatchPattern.includes("tight") ? 2 : 1.1} />
    </pattern>
  );
};

const findMaterial = (blueprint: BlueprintSchema, materialId: string | undefined): MaterialDefinition | null => {
  if (!materialId) {
    return null;
  }
  return (blueprint.materials ?? []).find((material) => material.id === materialId) ?? null;
};

export const renderPatternDefs = (blueprint: BlueprintSchema) => {
  const materials = blueprint.materials ?? [];
  if (materials.length === 0) {
    return null;
  }

  return <defs>{materials.map((material) => renderMaterialPattern(material))}</defs>;
};

const renderDoor = (door: Door, transform: ViewportTransform) => {
  const center = toScreen(door.x, door.y, transform);
  const widthPx = Math.max(10, safeNumber(door.width, 0.9) * transform.scale);
  const half = widthPx / 2;
  const swingDirection = door.swing === "right" ? 1 : -1;
  const angle = toDegrees(safeNumber(door.rotation, 0));
  const symbol = getDoorSymbol(door.type);

  return (
    <g key={door.id} transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
      <line x1={-half} y1={0} x2={half} y2={0} stroke="#7fd6ff" strokeWidth={2} />
      <line x1={-half} y1={0} x2={half} y2={swingDirection * half} stroke="#b7ecff" strokeWidth={1.2} />
      <path
        d={`M ${-half + widthPx} 0 A ${widthPx} ${widthPx} 0 0 ${swingDirection === 1 ? 1 : 0} ${-half + widthPx} ${
          swingDirection * half
        }`}
        fill="none"
        stroke="#7fd6ff"
        strokeDasharray="4 3"
        strokeWidth={1.1}
      />
      <title>{symbol.label}</title>
    </g>
  );
};

const renderWindow = (windowItem: Window, transform: ViewportTransform) => {
  const center = toScreen(windowItem.x, windowItem.y, transform);
  const widthPx = Math.max(10, safeNumber(windowItem.width, 1.2) * transform.scale);
  const half = widthPx / 2;
  const angle = toDegrees(safeNumber(windowItem.rotation, 0));
  const symbol = getWindowSymbol(windowItem.type);

  return (
    <g key={windowItem.id} transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
      <line x1={-half} y1={0} x2={half} y2={0} stroke="#c6f2ff" strokeWidth={3} />
      <line x1={-half + 2} y1={-3} x2={-half + 2} y2={3} stroke="#0f2737" strokeWidth={1.2} />
      <line x1={half - 2} y1={-3} x2={half - 2} y2={3} stroke="#0f2737" strokeWidth={1.2} />
      <title>{symbol.label}</title>
    </g>
  );
};

const renderFixture = (fixture: Fixture, transform: ViewportTransform) => {
  const center = toScreen(fixture.x, fixture.y, transform);
  const widthPx = Math.max(8, safeNumber(fixture.width, 0.8) * transform.scale);
  const heightPx = Math.max(8, safeNumber(fixture.height, 0.8) * transform.scale);
  const angle = toDegrees(safeNumber(fixture.rotation, 0));
  const symbol = getFixtureSymbol(fixture.kind);

  if (fixture.kind === "column") {
    return (
      <g key={fixture.id} transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
        <circle r={Math.max(4, widthPx * 0.5)} fill="#243849" stroke="#b7d4ea" strokeWidth={1.2} />
        <title>{symbol.label}</title>
      </g>
    );
  }

  if (fixture.kind === "stairs") {
    const steps = 6;
    const stepHeight = heightPx / steps;
    return (
      <g key={fixture.id} transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
        <rect x={-widthPx / 2} y={-heightPx / 2} width={widthPx} height={heightPx} fill="#223140" stroke="#9ebdd6" strokeWidth={1.2} />
        {Array.from({ length: steps }, (_, idx) => (
          <line
            key={`${fixture.id}_step_${idx}`}
            x1={-widthPx / 2}
            y1={-heightPx / 2 + idx * stepHeight}
            x2={widthPx / 2}
            y2={-heightPx / 2 + idx * stepHeight}
            stroke="#c5dff3"
            strokeWidth={0.8}
          />
        ))}
        <path d={`M ${-widthPx * 0.25} ${heightPx * 0.3} L 0 ${heightPx * 0.1} L ${widthPx * 0.25} ${heightPx * 0.3}`} fill="none" stroke="#c5dff3" strokeWidth={1.2} />
        <title>{symbol.label}</title>
      </g>
    );
  }

  return (
    <g key={fixture.id} transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
      <rect x={-widthPx / 2} y={-heightPx / 2} width={widthPx} height={heightPx} fill="#223140" stroke="#9ebdd6" strokeWidth={1.2} rx={3} ry={3} />
      <text x={0} y={3} textAnchor="middle" fontSize={9} fill="#d8eaf7">
        {symbol.label.slice(0, 3).toUpperCase()}
      </text>
      <title>{symbol.label}</title>
    </g>
  );
};

export const renderRoomsLayer = (floor: FloorPlan, blueprint: BlueprintSchema, transform: ViewportTransform) => {
  return floor.rooms.map((room) => {
    const center = centroid(room.polygon);
    const material = findMaterial(blueprint, room.floorMaterial);
    const fill = material ? `url(#${patternId(material.id)})` : "#1f2d3b";

    return (
      <g key={room.id}>
        <path d={toPath(room.polygon, transform)} fill={fill} stroke="#5d7b95" strokeWidth={1.2} />
        <text
          x={center.x * transform.scale + transform.offsetX}
          y={center.y * transform.scale + transform.offsetY}
          textAnchor="middle"
          fontSize={12}
          fill="#d9e9f7"
        >
          {room.label || room.name}
        </text>
      </g>
    );
  });
};

export const renderWallsLayer = (floor: FloorPlan, transform: ViewportTransform) => {
  return floor.walls.map((wall) => (
    <g key={wall.id}>
      <line
        x1={wall.start.x * transform.scale + transform.offsetX}
        y1={wall.start.y * transform.scale + transform.offsetY}
        x2={wall.end.x * transform.scale + transform.offsetX}
        y2={wall.end.y * transform.scale + transform.offsetY}
        stroke={wall.type === "exterior" ? "#f5f7fa" : "#a6c2db"}
        strokeWidth={Math.max(2, wall.thickness * transform.scale * 0.3)}
      />
      <text
        x={((wall.start.x + wall.end.x) * 0.5) * transform.scale + transform.offsetX}
        y={((wall.start.y + wall.end.y) * 0.5) * transform.scale + transform.offsetY - 4}
        textAnchor="middle"
        fontSize={10}
        fill="#8fb2ce"
      >
        {`${wallLength(wall).toFixed(1)}m`}
      </text>
    </g>
  ));
};

export const renderOpeningsLayer = (floor: FloorPlan, transform: ViewportTransform) => {
  return (
    <>
      {floor.doors.map((door) => renderDoor(door, transform))}
      {floor.windows.map((windowItem) => renderWindow(windowItem, transform))}
    </>
  );
};

export const renderFixturesLayer = (floor: FloorPlan, transform: ViewportTransform) => {
  return (floor.fixtures ?? []).map((fixture) => renderFixture(fixture, transform));
};

export const renderAnnotationsLayer = (floor: FloorPlan, blueprint: BlueprintSchema, transform: ViewportTransform) => {
  const all = [...(blueprint.annotations ?? []), ...(floor.annotations ?? [])].filter((annotation) => annotation.text.trim().length > 0);
  return all.map((annotation) => {
    const point = toScreen(annotation.x, annotation.y, transform);
    const angle = toDegrees(safeNumber(annotation.rotation ?? 0, 0));
    return (
      <g key={annotation.id} transform={`translate(${point.x} ${point.y}) rotate(${angle})`}>
        <text textAnchor="start" fontSize={10} fill="#ffe8a8" stroke="#101820" strokeWidth={0.4} paintOrder="stroke">
          {annotation.text}
        </text>
      </g>
    );
  });
};
