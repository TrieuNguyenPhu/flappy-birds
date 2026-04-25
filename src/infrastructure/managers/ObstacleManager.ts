/**
 * ObstacleManager - Manages obstacle generation, updates, and removal
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { Obstacle, OBSTACLE_CONFIG } from '@/core/entities/Obstacle';

/**
 * ObstacleManager configuration constants
 */
export const OBSTACLE_MANAGER_CONFIG = {
  SPAWN_INTERVAL: 2000, // Time between obstacle spawns in milliseconds
  INITIAL_DELAY: 1500, // Initial delay before first obstacle spawns
} as const;

/**
 * ObstacleManager class handles obstacle lifecycle management
 */
export class ObstacleManager {
  public obstacles: Obstacle[];
  private spawnTimer: number;
  private readonly spawnInterval: number;
  private readonly canvasHeight: number;
  private readonly minGapY: number;
  private readonly maxGapY: number;
  private hasSpawnedFirst: boolean;

  /**
   * Create a new ObstacleManager
   * 
   * @param canvasHeight - Height of the game canvas
   * @param spawnInterval - Time between obstacle spawns in milliseconds
   * @param minGapY - Minimum Y position for gap center
   * @param maxGapY - Maximum Y position for gap center
   */
  constructor(
    canvasHeight: number,
    spawnInterval: number = OBSTACLE_MANAGER_CONFIG.SPAWN_INTERVAL,
    minGapY: number = OBSTACLE_CONFIG.MIN_GAP_Y,
    maxGapY: number = OBSTACLE_CONFIG.MAX_GAP_Y
  ) {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.spawnInterval = spawnInterval;
    this.canvasHeight = canvasHeight;
    this.minGapY = minGapY;
    this.maxGapY = maxGapY;
    this.hasSpawnedFirst = false;
  }

  /**
   * Generate a new obstacle with randomized gap position
   * Validates Requirement 2.1: Generate Pipe obstacles at regular intervals
   * Validates Requirement 2.2: Randomize gap position within acceptable bounds
   * Validates Requirement 2.3: Pipe consists of top and bottom segments with navigable gap
   * 
   * @returns The newly created obstacle
   */
  public generateObstacle(): Obstacle {
    // Randomize gap position within acceptable bounds
    const gapPosition = this.randomizeGapPosition();

    // Create new obstacle at spawn position
    const obstacle = new Obstacle(
      OBSTACLE_CONFIG.SPAWN_X,
      gapPosition,
      this.canvasHeight
    );

    this.obstacles.push(obstacle);
    return obstacle;
  }

  /**
   * Update all obstacles and handle spawning
   * Validates Requirements: 2.1, 2.4, 2.5
   * 
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public updateObstacles(deltaTime: number): void {
    // Update spawn timer
    this.spawnTimer += deltaTime;

    // Check if it's time to spawn a new obstacle
    const spawnThreshold = this.hasSpawnedFirst 
      ? this.spawnInterval 
      : OBSTACLE_MANAGER_CONFIG.INITIAL_DELAY;

    if (this.spawnTimer >= spawnThreshold) {
      this.generateObstacle();
      this.spawnTimer = 0;
      this.hasSpawnedFirst = true;
    }

    // Update all existing obstacles
    for (const obstacle of this.obstacles) {
      obstacle.update(deltaTime);
    }

    // Remove off-screen obstacles
    this.removeOffscreenObstacles();
  }

  /**
   * Remove obstacles that have moved off-screen
   * Validates Requirement 2.4: Remove obstacles from memory when they move off the left edge
   */
  public removeOffscreenObstacles(): void {
    this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
  }

  /**
   * Reset the obstacle manager to initial state
   * Validates Requirement 8.5: Clear all existing Pipe obstacles on restart
   */
  public reset(): void {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.hasSpawnedFirst = false;
  }

  /**
   * Randomize gap position within acceptable bounds
   * Validates Requirement 2.2: Randomize gap position within acceptable bounds
   * 
   * @returns Random Y position for gap center
   */
  private randomizeGapPosition(): number {
    const range = this.maxGapY - this.minGapY;
    return this.minGapY + Math.random() * range;
  }

  /**
   * Get all current obstacles
   */
  public getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  /**
   * Get the number of active obstacles
   */
  public getObstacleCount(): number {
    return this.obstacles.length;
  }

  /**
   * Render all obstacles on the canvas
   * 
   * @param ctx - Canvas rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    for (const obstacle of this.obstacles) {
      obstacle.render(ctx);
    }
  }
}
