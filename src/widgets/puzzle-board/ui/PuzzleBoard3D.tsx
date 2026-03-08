'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import type { Board, Tile, ProcessResult } from '@/entities/tile';
import { Tile3D } from '@/entities/tile/ui/Tile3D';
import {
  TILE_3D_SIZE,
  TILE_3D_GAP,
  CAMERA_ZOOM,
} from '@/shared/config/constants';
import { usePuzzleInteraction } from '../hooks/usePuzzleInteraction';

interface PuzzleBoard3DProps {
  board: Board;
  setBoard: (board: Board) => void;
  onBoardChange: (result: ProcessResult) => void;
  disabled?: boolean;
}

function gridToWorld(
  row: number,
  col: number,
  rows: number,
  cols: number
): [number, number, number] {
  const spacing = TILE_3D_SIZE + TILE_3D_GAP;
  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetZ = ((rows - 1) * spacing) / 2;
  return [col * spacing - offsetX, 0, row * spacing - offsetZ];
}

interface AnimatedTileProps {
  worldPos: [number, number, number];
  tile: Tile;
  selected: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
}

function AnimatedTile({ worldPos, tile, selected, onPointerDown, onPointerUp }: AnimatedTileProps) {
  const spring = useSpring({
    position: [worldPos[0], 0, worldPos[2]] as [number, number, number],
    scale: 1,
    from: { position: [worldPos[0], 0, worldPos[2] - 1.5] as [number, number, number], scale: 0.7 },
    config: { tension: 300, friction: 25 },
  });

  return (
    <animated.group position={spring.position as unknown as [number, number, number]} scale={spring.scale}>
      <Tile3D
        color={tile.color}
        type={tile.type}
        selected={selected}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
    </animated.group>
  );
}

function BoardScene({ board, setBoard, onBoardChange, disabled = false }: PuzzleBoard3DProps) {
  const { selected, handlePointerDown, handlePointerUp } = usePuzzleInteraction({
    board,
    setBoard,
    onBoardChange,
    disabled,
  });

  const rows = board.length;
  const cols = rows > 0 ? board[0]!.length : 0;
  const spacing = TILE_3D_SIZE + TILE_3D_GAP;

  const boardWidth = cols * spacing;
  const boardHeight = rows * spacing;

  // Memoize tile data for stable animation keys
  const tiles = useMemo(() => {
    const result: Array<{
      tile: Tile;
      row: number;
      col: number;
      worldPos: [number, number, number];
    }> = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tile = board[r]?.[c];
        if (!tile) continue;
        result.push({
          tile,
          row: r,
          col: c,
          worldPos: gridToWorld(r, c, rows, cols),
        });
      }
    }
    return result;
  }, [board, rows, cols]);

  return (
    <>
      <OrthographicCamera
        makeDefault
        zoom={CAMERA_ZOOM}
        position={[0, 10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        near={0.1}
        far={100}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-3, 8, -3]} intensity={0.3} />

      {/* Board background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[boardWidth + 0.4, boardHeight + 0.4]} />
        <meshStandardMaterial
          color="#334155"
          transparent
          opacity={0.5}
          roughness={0.8}
        />
      </mesh>

      {/* Tiles */}
      {tiles.map(({ tile, row, col, worldPos }) => {
        const isSelected =
          selected?.row === row && selected?.col === col;

        return (
          <AnimatedTile
            key={tile.id}
            worldPos={worldPos}
            tile={tile}
            selected={isSelected}
            onPointerDown={() => handlePointerDown(row, col)}
            onPointerUp={() => handlePointerUp(row, col)}
          />
        );
      })}
    </>
  );
}

export function PuzzleBoard3D(props: PuzzleBoard3DProps) {
  const rows = props.board.length;
  const cols = rows > 0 ? props.board[0]!.length : 0;
  const spacing = TILE_3D_SIZE + TILE_3D_GAP;

  // Canvas size in pixels
  const canvasWidth = Math.max(cols * spacing * CAMERA_ZOOM + 40, 200);
  const canvasHeight = Math.max(rows * spacing * CAMERA_ZOOM + 40, 200);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      <Canvas
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <BoardScene {...props} />
      </Canvas>
    </div>
  );
}
