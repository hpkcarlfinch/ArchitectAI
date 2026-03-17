import type { FloorPlan, Point2D, Wall } from "../../types/blueprint";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export const getFloorBounds = (floor: FloorPlan): Bounds => {
  const points: Point2D[] = [];

  floor.rooms.forEach((room) => points.push(...room.polygon));
  floor.walls.forEach((wall) => {
    points.push(wall.start);
    points.push(wall.end);
  });

  if (points.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 10,
      maxY: 10,
      width: 10,
      height: 10,
    };
  }

  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
};

export const wallLength = (wall: Wall): number => {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const wallAngle = (wall: Wall): number => {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  return Math.atan2(dy, dx);
};

export const centroid = (polygon: Point2D[]): Point2D => {
  const count = polygon.length || 1;
  const sum = polygon.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 },
  );
  return { x: sum.x / count, y: sum.y / count };
};
