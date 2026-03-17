import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { MeshStandardMaterial, type Group } from "three";
import { EmptyState } from "../../components/EmptyState";
import type { BlueprintSchema, FloorPlan } from "../../types/blueprint";
import { buildFloorMeshes, preloadBitByBit } from "./bitbybitAdapter";
import { wallAngle, wallLength } from "../../services/blueprint/geometry";
import { createDoorPlacements, createFixturePlacements, createWindowPlacements, stairStepsCount } from "./blueprint3dHelpers";

interface Blueprint3DViewProps {
  blueprint: BlueprintSchema | null;
}

const FloorMeshes = ({ floorObject }: { floorObject: Group }) => {
  return <primitive object={floorObject} />;
};

const Walls = ({ floor }: { floor: FloorPlan }) => {
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

const Openings = ({ floor }: { floor: FloorPlan }) => {
  const doorOpenings = createDoorPlacements(floor);
  const windowOpenings = createWindowPlacements(floor);

  return (
    <group>
      {doorOpenings.map((opening) => (
        <mesh key={`door_opening_${opening.id}`} position={[opening.x, opening.y, opening.z]} rotation={[0, -opening.rotation, 0]}>
          <boxGeometry args={[opening.width, opening.height, 0.06]} />
          <meshStandardMaterial color="#4ac8ff" transparent opacity={0.25} roughness={0.2} metalness={0.05} />
        </mesh>
      ))}

      {windowOpenings.map((opening) => (
        <mesh key={`window_opening_${opening.id}`} position={[opening.x, opening.y, opening.z]} rotation={[0, -opening.rotation, 0]}>
          <boxGeometry args={[opening.width, opening.height, 0.05]} />
          <meshStandardMaterial color="#b6e9ff" transparent opacity={0.22} roughness={0.2} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
};

const Fixtures = ({ floor }: { floor: FloorPlan }) => {
  const fixtures = createFixturePlacements(floor);

  return (
    <group>
      {fixtures.map((fixture) => {
        if (fixture.kind === "stairs") {
          const steps = stairStepsCount(fixture);
          const stepHeight = fixture.height / steps;
          const stepDepth = fixture.depth / steps;

          return (
            <group key={`fixture_${fixture.id}`} position={[fixture.x, 0, fixture.z]} rotation={[0, -fixture.rotation, 0]}>
              {Array.from({ length: steps }, (_, index) => {
                const stepY = stepHeight * (index + 0.5);
                const depthAtStep = stepDepth * (index + 1);
                return (
                  <mesh key={`step_${fixture.id}_${index}`} position={[0, stepY, -fixture.depth / 2 + depthAtStep / 2]}>
                    <boxGeometry args={[fixture.width, stepHeight, depthAtStep]} />
                    <meshStandardMaterial color="#7f96ad" roughness={0.7} metalness={0.1} />
                  </mesh>
                );
              })}
            </group>
          );
        }

        const colorByKind: Partial<Record<typeof fixture.kind, string>> = {
          island: "#8ea2b7",
          cabinet: "#6f879f",
          bathtub: "#99bdd2",
          shower: "#83adc6",
          refrigerator: "#b3bec9",
          stove: "#848b94",
          sink: "#93a9be",
          toilet: "#9fbbd1",
        };

        return (
          <mesh
            key={`fixture_${fixture.id}`}
            position={[fixture.x, fixture.height / 2, fixture.z]}
            rotation={[0, -fixture.rotation, 0]}
          >
            <boxGeometry args={[fixture.width, fixture.height, fixture.depth]} />
            <meshStandardMaterial
              color={colorByKind[fixture.kind] ?? "#7f97ad"}
              roughness={fixture.kind === "shower" ? 0.3 : 0.75}
              metalness={fixture.kind === "sink" || fixture.kind === "stove" ? 0.2 : 0.1}
              transparent={fixture.kind === "shower"}
              opacity={fixture.kind === "shower" ? 0.45 : 1}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export const Blueprint3DView = ({ blueprint }: Blueprint3DViewProps) => {
  const floor = useMemo(() => blueprint?.floors[0] ?? null, [blueprint]);

  const floorObject = useMemo(() => {
    if (!floor) {
      return null;
    }
    return buildFloorMeshes(floor);
  }, [floor]);

  useEffect(() => {
    void preloadBitByBit();
  }, []);

  if (!floor || !floorObject) {
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
  <Walls floor={floor} />
  <Openings floor={floor} />
  <Fixtures floor={floor} />

        <gridHelper args={[50, 50, "#2d3d4a", "#1a262f"]} />
        <OrbitControls makeDefault target={[5, 0, 5]} />
      </Canvas>
    </div>
  );
};
