/**
 * Obstacle - Pipe obstacle entity with top and bottom segments
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { Rectangle } from '@/shared/types';

/**
 * Obstacle configuration constants
 */
export const OBSTACLE_CONFIG = {
  WIDTH: 80, // Pipe width in pixels
  GAP_SIZE: 150, // Gap between top and bottom pipes in pixels
  SPEED: 0.15, // Horizontal movement speed in pixels/ms
  MIN_GAP_Y: 100, // Minimum Y position for gap center
  MAX_GAP_Y: 500, // Maximum Y position for gap center
  SPAWN_X: 900, // X position where obstacles spawn (off-screen right)
  REMOVE_X: -100, // X position where obstacles are removed (off-screen left)
} as const;

/**
 * Obstacle class represents a pipe obstacle with top and bottom segments
 */
export class Obstacle {
  public topPipe: Rectangle;
  public bottomPipe: Rectangle;
  public gapPosition: number;
  public gapSize: number;
  public speed: number;
  public passed: boolean;

  private readonly width: number;
  private readonly canvasHeight: number;

  /**
   * Create a new obstacle
   * 
   * @param x - Initial X position
   * @param gapPosition - Y position of the gap center
   * @param canvasHeight - Height of the game canvas
   * @param width - Width of the pipes
   * @param gapSize - Size of the gap between pipes
   * @param speed - Horizontal movement speed
   */
  constructor(
    x: number,
    gapPosition: number,
    canvasHeight: number,
    width: number = OBSTACLE_CONFIG.WIDTH,
    gapSize: number = OBSTACLE_CONFIG.GAP_SIZE,
    speed: number = OBSTACLE_CONFIG.SPEED
  ) {
    this.width = width;
    this.gapSize = gapSize;
    this.gapPosition = gapPosition;
    this.speed = speed;
    this.canvasHeight = canvasHeight;
    this.passed = false;

    // Initialize top pipe (from top of canvas to gap start)
    this.topPipe = {
      x: x,
      y: 0,
      width: this.width,
      height: gapPosition - gapSize / 2,
    };

    // Initialize bottom pipe (from gap end to bottom of canvas)
    this.bottomPipe = {
      x: x,
      y: gapPosition + gapSize / 2,
      width: this.width,
      height: canvasHeight - (gapPosition + gapSize / 2),
    };
  }

  /**
   * Update obstacle position based on time
   * Validates Requirement 2.5: Pipes move horizontally from right to left at consistent speed
   * 
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    // Move obstacle to the left
    const movement = this.speed * deltaTime;
    this.topPipe.x -= movement;
    this.bottomPipe.x -= movement;
  }

  /**
   * Check if obstacle is off-screen (left side)
   * Validates Requirement 2.4: Remove obstacles that move off the left edge
   * 
   * @returns True if obstacle is completely off-screen
   */
  public isOffScreen(): boolean {
    return this.topPipe.x + this.width < OBSTACLE_CONFIG.REMOVE_X;
  }

  /**
   * Get the X position of the obstacle
   */
  public getX(): number {
    return this.topPipe.x;
  }

  /**
   * Mark this obstacle as passed by the bird
   */
  public markAsPassed(): void {
    this.passed = true;
  }

  /**
   * Check if the bird has passed this obstacle
   */
  public isPassed(): boolean {
    return this.passed;
  }

  /**
   * Render the obstacle on the canvas
   * Validates Requirement 7.3: Consistent visual styling and clear boundaries
   * 
   * @param ctx - Canvas rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    // Pipe colors
    const pipeColor = '#5cb85c';
    const pipeOutlineColor = '#4a934a';
    const pipeCapColor = '#6cc76c';

    // Draw top pipe
    this.renderPipe(ctx, this.topPipe, pipeColor, pipeOutlineColor, pipeCapColor, true);

    // Draw bottom pipe
    this.renderPipe(ctx, this.bottomPipe, pipeColor, pipeOutlineColor, pipeCapColor, false);
  }

  /**
   * Render a single pipe segment
   * 
   * @param ctx - Canvas rendering context
   * @param pipe - Pipe rectangle to render
   * @param color - Main pipe color
   * @param outlineColor - Outline color
   * @param capColor - Cap color
   * @param isTop - Whether this is a top pipe (affects cap position)
   */
  private renderPipe(
    ctx: CanvasRenderingContext2D,
    pipe: Rectangle,
    color: string,
    outlineColor: string,
    capColor: string,
    isTop: boolean
  ): void {
    // Draw main pipe body
    ctx.fillStyle = color;
    ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);

    // Draw pipe outline
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);

    // Draw pipe cap (wider section at the end)
    const capHeight = 30;
    const capWidth = pipe.width + 8;
    const capX = pipe.x - 4;
    let capY: number;

    if (isTop) {
      // Cap at bottom of top pipe
      capY = pipe.y + pipe.height - capHeight;
    } else {
      // Cap at top of bottom pipe
      capY = pipe.y;
    }

    ctx.fillStyle = capColor;
    ctx.fillRect(capX, capY, capWidth, capHeight);

    ctx.strokeStyle = outlineColor;
    ctx.strokeRect(capX, capY, capWidth, capHeight);

    // Draw vertical stripes on pipe for texture
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1;
    const stripeSpacing = 20;
    for (let i = pipe.x + stripeSpacing; i < pipe.x + pipe.width; i += stripeSpacing) {
      ctx.beginPath();
      ctx.moveTo(i, pipe.y);
      ctx.lineTo(i, pipe.y + pipe.height);
      ctx.stroke();
    }
  }
}
