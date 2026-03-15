import { Group, Mesh, MeshStandardMaterial, Shape, ShapeGeometry } from "three";
import type { FloorPlan } from "../../types/blueprint";

let bitbybitLoaded = false;

export const preloadBitByBit = async (): Promise<void> => {
  if (bitbybitLoaded) {
    return;
  }

  try {
    await import("@bitbybit-dev/threejs");
    bitbybitLoaded = true;
  } catch {
    bitbybitLoaded = false;
  }
};

export const buildFloorMeshes = (floor: FloorPlan): Group => {
  const group = new Group();
  const material = new MeshStandardMaterial({ color: "#3d4a57", roughness: 0.9, metalness: 0.05 });

  floor.rooms.forEach((room) => {
    const shape = new Shape();
    room.polygon.forEach((point, index) => {
      if (index === 0) {
        shape.moveTo(point.x, point.y);
      } else {
        shape.lineTo(point.x, point.y);
      }
    });
    shape.closePath();

    const geometry = new ShapeGeometry(shape);
    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    group.add(mesh);
  });

  return group;
};
