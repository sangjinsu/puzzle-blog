'use client';

import { useRef, useMemo } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import type { Mesh } from 'three';
import { Color } from 'three';
import type { TileColor, TileType } from '../model/types';
import {
  TILE_3D_SIZE,
  TILE_3D_HEIGHT,
  TILE_3D_RADIUS,
  TILE_3D_COLORS,
} from '@/shared/config/constants';

const ITEM_ICON: Record<TileType, string> = {
  normal: '',
  rocket_h: '🚀',
  rocket_v: '🚀',
  bomb: '💣',
};

interface Tile3DProps {
  color: TileColor;
  type: TileType;
  selected?: boolean;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
}

export function Tile3D({
  color,
  type,
  selected = false,
  onPointerDown,
  onPointerUp,
}: Tile3DProps) {
  const meshRef = useRef<Mesh>(null);
  const isItem = type !== 'normal';

  const tileColor = useMemo(() => new Color(TILE_3D_COLORS[color]), [color]);
  const emissiveColor = useMemo(() => {
    if (selected) return new Color('#FFFFFF');
    if (isItem) return new Color('#F59E0B');
    return new Color('#000000');
  }, [selected, isItem]);
  const emissiveIntensity = selected ? 0.4 : isItem ? 0.2 : 0;

  return (
    <group onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <RoundedBox
        ref={meshRef}
        args={[TILE_3D_SIZE, TILE_3D_SIZE, TILE_3D_HEIGHT]}
        radius={TILE_3D_RADIUS}
        smoothness={4}
      >
        <meshStandardMaterial
          color={tileColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, TILE_3D_HEIGHT / 2 + 0.01]}>
          <ringGeometry args={[TILE_3D_SIZE * 0.45, TILE_3D_SIZE * 0.52, 32]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Item icon */}
      {isItem && (
        <Text
          position={[0, 0, TILE_3D_HEIGHT / 2 + 0.02]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.45}
          anchorX="center"
          anchorY="middle"
        >
          {ITEM_ICON[type]}
        </Text>
      )}
    </group>
  );
}
