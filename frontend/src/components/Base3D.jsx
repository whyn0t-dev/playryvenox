import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Tile({ x, z, hasBuilding, onClick, onPointerEnter, onPointerLeave }) {
  return (
    <mesh
      position={[x, 0, z]}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={hasBuilding ? "#22c55e" : "#1e293b"} />
    </mesh>
  );
}

function WallModel({ connections }) {
  const { top, bottom, left, right } = connections;

  if (top && right && !left && !bottom) {
    return (
      <group>
        <mesh position={[0, 0.25, -0.2]}>
          <boxGeometry args={[0.2, 0.5, 0.6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0.2, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.2]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[0, 0.25, 0]}>
      <boxGeometry args={[1, 0.5, 0.2]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
  );
}

function Building({ x, z, type, connections }) {
  if (type === "generator") {
    return (
      <group position={[x, 0, z]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.3, 0.5, 16]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      </group>
    );
  }

  if (type === "storage") {
    return (
      <mesh position={[x, 0.4, z]}>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    );
  }

  if (type === "wall") {
    return (
      <group position={[x, 0, z]}>
        <WallModel connections={connections} />
      </group>
    );
  }

  if (type === "core") {
    return (
      <mesh position={[x, 0.6, z]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    );
  }

  return null;
}

function GhostTile({ x, z, canBuild }) {
  return (
    <mesh position={[x, 0.05, z]}>
      <boxGeometry args={[1, 0.05, 1]} />
      <meshStandardMaterial
        color={canBuild ? "#22c55e" : "#ef4444"}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function AnimatedBuilding({ position, children }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
    }
  });

  return (
    <group ref={ref} position={position} scale={[0, 0, 0]}>
      {children}
    </group>
  );
}

function getWallConnections(buildings, x, y) {
  const isWall = (tx, ty) =>
    buildings.some((b) => b.type === "wall" && b.x === tx && b.y === ty);

  return {
    top: isWall(x, y - 1),
    bottom: isWall(x, y + 1),
    left: isWall(x - 1, y),
    right: isWall(x + 1, y),
  };
}

export default function Base3D({ data, onBuild }) {
  const [hovered, setHovered] = useState(null);

  const offsetX = (data.grid.width - 1) / 2;
  const offsetY = (data.grid.height - 1) / 2;

  return (
    <Canvas camera={{ position: [6, 8, 10], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />

      <OrbitControls />

      {Array.from({ length: data.grid.width * data.grid.height }).map((_, i) => {
        const x = i % data.grid.width;
        const y = Math.floor(i / data.grid.width);

        const building = data.buildings.find((b) => b.x === x && b.y === y);

        const worldX = x - offsetX;
        const worldZ = y - offsetY;

        const connections =
          building?.type === "wall"
            ? getWallConnections(data.buildings, x, y)
            : null;

        return (
          <group key={`${x}-${y}`}>
            <Tile
              x={worldX}
              z={worldZ}
              hasBuilding={!!building}
              onClick={() => !building && onBuild(x, y)}
              onPointerEnter={() => setHovered({ x, y })}
              onPointerLeave={() => setHovered(null)}
            />

            {building && (
              <AnimatedBuilding position={[worldX, 0, worldZ]}>
                <Building
                  x={0}
                  z={0}
                  type={building.type}
                  connections={connections}
                />
              </AnimatedBuilding>
            )}
          </group>
        );
      })}

      {hovered && (
        <GhostTile
          x={hovered.x - offsetX}
          z={hovered.y - offsetY}
          canBuild={
            !data.buildings.some((b) => b.x === hovered.x && b.y === hovered.y)
          }
        />
      )}
    </Canvas>
  );
}