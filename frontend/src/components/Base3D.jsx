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
      <boxGeometry args={[1.02, 0.12, 1.02]} />
      <meshStandardMaterial color={hasBuilding ? "#22c55e" : "#1e293b"} />
    </mesh>
  );
}

function WallModel({ connections }) {
  const { top, bottom, left, right } = connections;

  const height = 0.5;
  const thickness = 0.18;

  const centerSize = 0.28;
  const armLength = (1 - centerSize) / 2;

  return (
    <group>
      {/* centre */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[centerSize, height, centerSize]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* haut */}
      {top && (
        <mesh position={[0, height / 2, -(centerSize / 2 + armLength / 2)]}>
          <boxGeometry args={[thickness, height, armLength]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}

      {/* bas */}
      {bottom && (
        <mesh position={[0, height / 2, centerSize / 2 + armLength / 2]}>
          <boxGeometry args={[thickness, height, armLength]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}

      {/* gauche */}
      {left && (
        <mesh position={[-(centerSize / 2 + armLength / 2), height / 2, 0]}>
          <boxGeometry args={[armLength, height, thickness]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}

      {/* droite */}
      {right && (
        <mesh position={[centerSize / 2 + armLength / 2, height / 2, 0]}>
          <boxGeometry args={[armLength, height, thickness]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}

      {/* mur isolé : petit segment horizontal par défaut */}
      {!top && !bottom && !left && !right && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[0.7, height, thickness]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      )}
    </group>
  );
}

function CannonFire({ active = true }) {
  const flashRef = useRef();
  const projectileRef = useRef();

  useFrame(({ clock }) => {
    if (!active) return;

    const t = clock.getElapsedTime();
    const cycle = (t * 1.5) % 1;

    if (flashRef.current) {
      const visible = cycle < 0.12;
      flashRef.current.visible = visible;
      flashRef.current.scale.setScalar(visible ? 1 + cycle * 3 : 0.001);
    }

    if (projectileRef.current) {
      const visible = cycle >= 0.08 && cycle < 0.35;
      projectileRef.current.visible = visible;

      if (visible) {
        const p = (cycle - 0.08) / (0.35 - 0.08);
        projectileRef.current.position.z = -0.9 - p * 1.8;
      }
    }
  });

  return (
    <group position={[0, 1.15, -0.65]}>
      <mesh ref={flashRef} visible={false}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      <mesh ref={projectileRef} visible={false} position={[0, 0, -0.9]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
    </group>
  );
}

function DefenseTowerModel({ preview = false }) {
  const turretRef = useRef();

  useFrame(({ clock }) => {
    if (turretRef.current && !preview) {
      turretRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.35;
    }
  });

  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.4, 20]} />
        <meshStandardMaterial color={preview ? "#93c5fd" : "#475569"} />
      </mesh>

      {/* colonne */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.7, 20]} />
        <meshStandardMaterial color={preview ? "#60a5fa" : "#64748b"} />
      </mesh>

      {/* plateforme haute */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.18, 20]} />
        <meshStandardMaterial color={preview ? "#93c5fd" : "#94a3b8"} />
      </mesh>

      {/* tourelle */}
      <group ref={turretRef} position={[0, 1.15, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.42, 0.24, 0.42]} />
          <meshStandardMaterial color={preview ? "#bfdbfe" : "#cbd5e1"} />
        </mesh>

        {/* canon */}
        <mesh position={[0, 0.05, -0.45]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 16]} />
          <meshStandardMaterial color={preview ? "#93c5fd" : "#334155"} />
        </mesh>

        <mesh position={[0, 0.05, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 16]} />
          <meshStandardMaterial color={preview ? "#93c5fd" : "#334155"} />
        </mesh>

        {!preview && <CannonFire active />}
      </group>
    </group>
  );
}

function Building({ x, z, type, rotation = 0, connections }) {
  const rotationY = (rotation * Math.PI) / 180;

  if (type === "generator") {
    return (
      <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
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
      <mesh position={[x, 0.4, z]} rotation={[0, rotationY, 0]}>
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

  if (type === "defense_tower") {
    return (
      <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
        <DefenseTowerModel />
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
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.02, 0.12, 1.02]} />
        <meshStandardMaterial
          color={canBuild ? "#22c55e" : "#ef4444"}
          transparent
          opacity={0.55}
          emissive={canBuild ? "#14532d" : "#7f1d1d"}
          emissiveIntensity={0.8}
        />
      </mesh>

      <mesh position={[0, 0.13, 0]}>
        <ringGeometry args={[0.28, 0.42, 24]} />
        <meshBasicMaterial
          color={canBuild ? "#86efac" : "#fca5a5"}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
function GhostBuilding({ x, z, type, rotation = 0, connections, canBuild }) {
  const rotationY = (rotation * Math.PI) / 180;
  const color = canBuild ? "#86efac" : "#fca5a5";

  if (type === "generator") {
    return (
      <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
          <meshStandardMaterial transparent opacity={0.55} color={color} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.3, 0.5, 16]} />
          <meshStandardMaterial transparent opacity={0.55} color={color} />
        </mesh>
      </group>
    );
  }

  if (type === "storage") {
    return (
      <mesh position={[x, 0.4, z]} rotation={[0, rotationY, 0]}>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial transparent opacity={0.55} color={color} />
      </mesh>
    );
  }

  if (type === "wall") {
    return (
      <group position={[x, 0, z]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1, 0.5, 0.2]} />
          <meshStandardMaterial transparent opacity={0.55} color={color} />
        </mesh>
      </group>
    );
  }

  if (type === "defense_tower") {
    return (
      <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
        <group>
          <mesh position={[0, 0.2, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.42, 0.5, 0.4, 20]} />
            <meshStandardMaterial transparent opacity={0.55} color={color} />
          </mesh>

          <mesh position={[0, 0.75, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.28, 0.32, 0.7, 20]} />
            <meshStandardMaterial transparent opacity={0.55} color={color} />
          </mesh>

          <mesh position={[0, 1.15, 0]} raycast={() => null}>
            <cylinderGeometry args={[0.38, 0.38, 0.18, 20]} />
            <meshStandardMaterial transparent opacity={0.55} color={color} />
          </mesh>

          <mesh position={[0, 1.27, 0]} raycast={() => null}>
            <boxGeometry args={[0.42, 0.24, 0.42]} />
            <meshStandardMaterial transparent opacity={0.55} color={color} />
          </mesh>

          <mesh
            position={[0, 1.2, -0.45]}
            rotation={[Math.PI / 2, 0, 0]}
            raycast={() => null}
          >
            <cylinderGeometry args={[0.08, 0.08, 0.7, 16]} />
            <meshStandardMaterial transparent opacity={0.55} color={color} />
          </mesh>
        </group>
      </group>
    );
  }

  if (type === "core") {
    return (
      <mesh position={[x, 0.6, z]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial transparent opacity={0.55} color={color} />
      </mesh>
    );
  }

  return null;
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

export default function Base3D({
  data,
  onBuild,
  selectedBuildingType = "wall",
  selectedRotation = 0,
}) {
  const [hovered, setHovered] = useState(null);

  const offsetX = (data.grid.width - 1) / 2;
  const offsetY = (data.grid.height - 1) / 2;

  return (
    <Canvas camera={{ position: [6, 8, 10], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />

      <OrbitControls
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.2}
      />

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
                  rotation={building.rotation ?? 0}
                  connections={connections}
                />
              </AnimatedBuilding>
            )}
          </group>
        );
      })}

      {hovered && (() => {
        const occupied = data.buildings.some(
          (b) => b.x === hovered.x && b.y === hovered.y
        );

        const canBuild = !occupied;

        return (
          <>
            <GhostTile
              x={hovered.x - offsetX}
              z={hovered.y - offsetY}
              canBuild={canBuild}
            />

            {selectedBuildingType && (
              <GhostBuilding
                x={hovered.x - offsetX}
                z={hovered.y - offsetY}
                type={selectedBuildingType}
                rotation={selectedRotation}
                canBuild={canBuild}
              />
            )}
          </>
        );
      })()}
    </Canvas>
  );
}