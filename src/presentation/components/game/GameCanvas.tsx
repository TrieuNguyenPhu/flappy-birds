'use client';

import { useEffect, useRef, useState } from 'react';
import { CanvasSize } from '@/shared/types';

interface GameCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onCanvasReady?: (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => void;
}

export default function GameCanvas({
  width = 800,
  height = 600,
  className = '',
  onCanvasReady,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width, height });

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Maintain aspect ratio
      const aspectRatio = width / height;
      let newWidth = containerWidth;
      let newHeight = containerWidth / aspectRatio;

      // If height exceeds container, scale based on height instead
      if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = containerHeight * aspectRatio;
      }

      setCanvasSize({
        width: Math.floor(newWidth),
        height: Math.floor(newHeight),
      });
    };

    // Initial size calculation
    updateCanvasSize();

    // Update on window resize
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [width, height]);

  // Notify parent whenever canvas is ready or resized.
  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Notify parent component that canvas is ready
    // Parent will handle initial rendering
    if (onCanvasReady) {
      onCanvasReady(canvas, ctx);
    }
  }, [canvasSize, onCanvasReady]);

  return (
    <div
      ref={containerRef}
      className={`game-canvas-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  );
}
