'use client';

import { useCallback, useEffect, useRef } from 'react';
import GameCanvas from '@/presentation/components/game/GameCanvas';
import { GameEngine } from '@/infrastructure/engine/GameEngine';

export default function Home() {
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, []);

  const handleCanvasReady = useCallback((
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    if (!gameEngineRef.current) {
      const engine = new GameEngine();
      engine.initialize(canvas, ctx);
      gameEngineRef.current = engine;
      return;
    }

    gameEngineRef.current.resize(canvas.width, canvas.height);
  }, []);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <GameCanvas width={800} height={600} onCanvasReady={handleCanvasReady} />
    </main>
  );
}
