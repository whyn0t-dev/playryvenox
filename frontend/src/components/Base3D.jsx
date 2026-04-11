import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Tile({ x, z, hasBuilding, onClick }) {
  return (
    <mesh position={[x, 0, z]} onClick={onClick}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={hasBuilding ? "#22c55e" : "#1e293b"} />
    </mesh>
  );
}

function Building({ x, z }) {
  return (
    <mesh position={[x, 0.55, z]}>
      <boxGeometry args={[0.6, 1, 0.6]} />
      <meshStandardMaterial color="#f59e0b" />
    </mesh>
  );
}

export default function Base3D({ data, onBuild }) {
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

        return (
          <group key={`${x}-${y}`}>
            <Tile
              x={worldX}
              z={worldZ}
              hasBuilding={!!building}
              onClick={() => !building && onBuild(x, y)}
            />

            {building && <Building x={worldX} z={worldZ} />}
          </group>
        );
      })}
    </Canvas>
  );
}