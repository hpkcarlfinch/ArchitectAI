import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { MeshStandardMaterial, type Group } from "three";
import { EmptyState } from "../../components/EmptyState";
import type { BlueprintSchema } from "../../types/blueprint";
import { buildFloorMeshes, preloadBitByBit } from "./bitbybitAdapter";
import { wallAngle, wallLength } from "../../services/blueprint/geometry";

interface Blueprint3DViewProps {
  blueprint: BlueprintSchema | null;
}

const FloorMeshes = ({ floorObject }: { floorObject: Group }) => {
  return <primitive object={floorObject} />;
};

const Walls = ({ blueprint }: { blueprint: BlueprintSchema }) => {
  const floor = blueprint.floors[0];
  const wallMaterial = new MeshStandardMaterial({ color: "#8e98a4", roughness: 0.7, metalness: 0.1 });

  return (
    <group>
      {floor.walls.map((wall) => {
        const length = wallLength(wall);
        const angle = wallAngle(wall);
        const x = (wall.start.x + wall.end.x) / 2;
        const z = (wall.start.y + wall.end.y) / 2;
        const height = floor.ceilingHeight;

        return (
          <mesh key={wall.id} position={[x, height / 2, z]} rotation={[0, -angle, 0]} material={wallMaterial}>
            <boxGeometry args={[length, height, wall.thickness]} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Blueprint3DView = ({ blueprint }: Blueprint3DViewProps) => {
  const floorObject = useMemo(() => {
    if (!blueprint) {
      return null;
    }
    return buildFloorMeshes(blueprint.floors[0]);
  }, [blueprint]);

  useEffect(() => {
    void preloadBitByBit();
  }, []);

  if (!blueprint || !floorObject) {
    return (
      <EmptyState
        title="No 3D model yet"
        description="Generate a blueprint first. The same plan data powers this 3D view."
      />
    );
  }

  return (
    <div className="render-surface render-3d">
      <Canvas shadows>
        <color attach="background" args={["#0f1720"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 12, 8]} intensity={1.2} castShadow />
        <PerspectiveCamera makeDefault position={[10, 12, 10]} fov={50} />

        <FloorMeshes floorObject={floorObject} />
        <Walls blueprint={blueprint} />

        <gridHelper args={[50, 50, "#2d3d4a", "#1a262f"]} />
        <OrbitControls makeDefault target={[5, 0, 5]} />
      </Canvas>
    </div>
  );
};
