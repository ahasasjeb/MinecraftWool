import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { WOOL_COLORS, CHUNK_SIZE } from '../constants';
import { WoolColor } from '../types';

interface WoolVisualizerProps {
  blocks: number[];
}

const TempObject = new THREE.Object3D();

const InstanceRenderer: React.FC<{ blocks: number[] }> = ({ blocks }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Precompute positions and colors
  const { positions, colorArray } = useMemo(() => {
    const pos = [];
    const cols = [];
    const colorMap = new Map<number, THREE.Color>();

    // Cache THREE.Colors
    Object.keys(WOOL_COLORS).forEach((key) => {
      const k = Number(key) as WoolColor;
      colorMap.set(k, new THREE.Color(WOOL_COLORS[k]));
    });

    for (let i = 0; i < blocks.length; i++) {
      const colorIndex = blocks[i];
      
      // Calculate 3D coordinates based on Minecraft-like stacking
      // Fill X, then Z, then Y (Layers)
      const layerSize = CHUNK_SIZE * CHUNK_SIZE;
      const y = Math.floor(i / layerSize);
      const remain = i % layerSize;
      const z = Math.floor(remain / CHUNK_SIZE);
      const x = remain % CHUNK_SIZE;

      pos.push({ x, y, z });
      
      const color = colorMap.get(colorIndex) || new THREE.Color('#ffffff');
      cols.push(color.r, color.g, color.b);
    }
    
    return { positions: pos, colorArray: new Float32Array(cols) };
  }, [blocks]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    // Set positions
    positions.forEach((p, i) => {
      TempObject.position.set(p.x, p.y, p.z);
      TempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, TempObject.matrix);
    });

    for(let i=0; i<blocks.length; i++) {
        const color = new THREE.Color(WOOL_COLORS[blocks[i] as WoolColor]);
        meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

  }, [positions, blocks]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, blocks.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.95, 0.95, 0.95]} /> {/* Slightly smaller to see gaps */}
      <meshStandardMaterial />
    </instancedMesh>
  );
};

export const WoolVisualizer: React.FC<WoolVisualizerProps> = ({ blocks }) => {
  // Calculate center to look at
  const layerSize = CHUNK_SIZE * CHUNK_SIZE;
  const height = Math.ceil(blocks.length / layerSize);
  const centerY = height / 2;
  const centerXZ = CHUNK_SIZE / 2;

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[CHUNK_SIZE * 2, height + 10, CHUNK_SIZE * 2]} />
        <OrbitControls target={[centerXZ, centerY, centerXZ]} autoRotate={blocks.length > 0} autoRotateSpeed={0.5} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]} 
        />
        
        <Environment preset="city" />

        <group>
           <InstanceRenderer blocks={blocks} />
           {/* Floor Grid */}
           <Grid 
             position={[centerXZ - 0.5, -0.5, centerXZ - 0.5]} 
             args={[CHUNK_SIZE * 2, CHUNK_SIZE * 2]} 
             cellSize={1} 
             cellThickness={1} 
             cellColor="#6f6f6f" 
             sectionSize={CHUNK_SIZE}
             sectionThickness={1.5}
             sectionColor="#9d4b4b"
             infiniteGrid
             fadeDistance={50}
             fadeStrength={1}
           />
        </group>
      </Canvas>
      
      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded text-xs text-white border border-white/10 pointer-events-none">
        <div className="font-mono space-y-1">
          <p><span className="text-gray-400">方块总数:</span> {blocks.length.toLocaleString()}</p>
          <p><span className="text-gray-400">区块大小:</span> {CHUNK_SIZE}x{CHUNK_SIZE}</p>
          <p><span className="text-gray-400">堆叠高度:</span> {height} 层</p>
          <p><span className="text-gray-400">数据大小:</span> {Math.ceil(blocks.length / 2).toLocaleString()} bytes</p>
        </div>
      </div>
    </div>
  );
};
