/**
 * Canvas utility functions for the Flappy Bird game
 */

/**
 * Get the 2D rendering context from a canvas element
 * @param canvas - The canvas element
 * @returns The 2D rendering context or null if unavailable
 */
export function getCanvasContext(
  canvas: HTMLCanvasElement | null
): CanvasRenderingContext2D | null {
  if (!canvas) return null;
  return canvas.getContext('2d');
}

/**
 * Clear the entire canvas with a specified color
 * @param ctx - The canvas rendering context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param color - Fill color (default: sky blue)
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string = '#70c5ce'
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Calculate responsive canvas dimensions while maintaining aspect ratio
 * @param containerWidth - Width of the container element
 * @param containerHeight - Height of the container element
 * @param targetWidth - Target canvas width
 * @param targetHeight - Target canvas height
 * @returns Calculated width and height that fit within container
 */
export function calculateResponsiveSize(
  containerWidth: number,
  containerHeight: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number } {
  const aspectRatio = targetWidth / targetHeight;
  let width = containerWidth;
  let height = containerWidth / aspectRatio;

  // If height exceeds container, scale based on height instead
  if (height > containerHeight) {
    height = containerHeight;
    width = containerHeight * aspectRatio;
  }

  return {
    width: Math.floor(width),
    height: Math.floor(height),
  };
}

/**
 * Set up high DPI canvas for crisp rendering on retina displays
 * @param canvas - The canvas element
 * @param width - Logical width
 * @param height - Logical height
 * @returns The device pixel ratio used
 */
export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): number {
  const dpr = window.devicePixelRatio || 1;
  
  // Set actual size in memory (scaled to account for extra pixel density)
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  
  // Set display size (css pixels)
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  // Scale all drawing operations by the dpr
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  
  return dpr;
}
