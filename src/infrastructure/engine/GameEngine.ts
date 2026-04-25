/**
 * GameEngine - Core game orchestrator managing game loop and state transitions
 * 
 * Validates Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 4.1, 4.2, 4.3, 4.5
 */

import { GameState, Rectangle } from '@/shared/types';
import { GAME_CONFIG } from '@/shared/constants/game.constants';
import { Bird } from '@/core/entities/Bird';
import { PhysicsSystem } from './PhysicsSystem';
import { CollisionDetector } from './CollisionDetector';
import { ObstacleManager } from '@/infrastructure/managers/ObstacleManager';
import { ScoreManager } from '@/infrastructure/managers/ScoreManager';
import { InputHandler } from './InputHandler';

export class GameEngine {
  private state: GameState;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // Game entities and systems
  private bird: Bird | null = null;
  private physicsSystem: PhysicsSystem;
  private collisionDetector: CollisionDetector;
  private obstacleManager: ObstacleManager | null = null;
  private scoreManager: ScoreManager;
  private inputHandler: InputHandler | null = null;
  private canvasBounds: Rectangle;

  constructor() {
    this.state = GameState.READY;
    this.fixedTimeStep = 1000 / GAME_CONFIG.PERFORMANCE.TARGET_FPS;
    this.physicsSystem = new PhysicsSystem();
    this.collisionDetector = new CollisionDetector();
    this.scoreManager = new ScoreManager();
    this.canvasBounds = {
      x: 0,
      y: 0,
      width: GAME_CONFIG.CANVAS.WIDTH,
      height: GAME_CONFIG.CANVAS.HEIGHT,
    };
  }

  /**
   * Initialize the game engine with canvas context
   */
  public initialize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.ctx = ctx;

    // Update canvas bounds
    this.canvasBounds.width = canvas.width;
    this.canvasBounds.height = canvas.height;

    // Initialize game entities
    this.bird = new Bird(
      this.physicsSystem,
      GAME_CONFIG.BIRD.START_X,
      GAME_CONFIG.BIRD.START_Y,
      GAME_CONFIG.BIRD.WIDTH,
      GAME_CONFIG.BIRD.HEIGHT
    );

    this.obstacleManager = new ObstacleManager(
      canvas.height,
      GAME_CONFIG.OBSTACLES.SPAWN_INTERVAL,
      GAME_CONFIG.OBSTACLES.MIN_GAP_Y,
      GAME_CONFIG.OBSTACLES.MAX_GAP_Y
    );

    // Initialize input handler
    this.inputHandler = new InputHandler(this);
    this.inputHandler.enableInput();

    // Render initial ready screen
    this.render(0);
  }

  /**
   * Handle canvas resize and redraw current frame.
   */
  public resize(width: number, height: number): void {
    this.canvasBounds.width = width;
    this.canvasBounds.height = height;

    if (this.state !== GameState.PLAYING) {
      this.render(0);
    }
  }

  /**
   * Get the bird entity
   */
  public getBird(): Bird | null {
    return this.bird;
  }

  /**
   * Get the obstacle manager
   */
  public getObstacleManager(): ObstacleManager | null {
    return this.obstacleManager;
  }

  /**
   * Get the score manager
   */
  public getScoreManager(): ScoreManager {
    return this.scoreManager;
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return this.state;
  }

  /**
   * Start the game - transition from READY to PLAYING
   * Validates Requirement 6.2: Transition to active gameplay state on first input
   */
  public start(): void {
    if (this.state === GameState.READY) {
      this.state = GameState.PLAYING;
      this.lastTime = performance.now();
      this.startGameLoop();
    }
  }

  /**
   * Pause the game - transition from PLAYING to PAUSED
   * Validates Requirement 6.4: Pause all physics and movement
   */
  public pause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.stopGameLoop();
    }
  }

  /**
   * Resume the game from paused state
   */
  public resume(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.lastTime = performance.now();
      this.startGameLoop();
    }
  }

  /**
   * Restart the game - reset to READY state
   * Validates Requirement 6.5: Reset all components to initial state
   */
  public restart(): void {
    this.stopGameLoop();
    this.state = GameState.READY;
    this.accumulator = 0;
    this.lastTime = 0;
    
    // Reset game entities
    if (this.bird) {
      this.bird.reset();
    }
    if (this.obstacleManager) {
      this.obstacleManager.reset();
    }
    // Reset score
    this.scoreManager.reset();
    
    // Render ready screen
    this.render(0);
  }

  /**
   * Trigger game over state
   * Validates Requirement 6.3: Transition to game over state on collision
   */
  public gameOver(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.GAME_OVER;
      this.stopGameLoop();
    }
  }

  /**
   * Start the game loop using requestAnimationFrame
   * Implements fixed timestep with interpolation for smooth rendering
   * Validates Requirement 7.1: Render at 60 frames per second
   */
  private startGameLoop(): void {
    if (this.animationFrameId !== null) {
      return; // Already running
    }

    const gameLoop = (currentTime: number) => {
      if (this.state !== GameState.PLAYING) {
        this.animationFrameId = null;
        return;
      }

      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      // Cap delta time to prevent spiral of death
      const cappedDelta = Math.min(deltaTime, GAME_CONFIG.PERFORMANCE.MAX_DELTA_TIME);
      this.accumulator += cappedDelta;

      // Fixed timestep updates
      while (this.accumulator >= this.fixedTimeStep) {
        this.update(this.fixedTimeStep);
        this.accumulator -= this.fixedTimeStep;
      }

      // Render with interpolation factor
      const interpolation = this.accumulator / this.fixedTimeStep;
      this.render(interpolation);

      this.animationFrameId = requestAnimationFrame(gameLoop);
    };

    this.animationFrameId = requestAnimationFrame(gameLoop);
  }

  /**
   * Stop the game loop
   */
  private stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Update game logic with fixed timestep
   * Validates Requirements: 4.1, 4.2, 4.3, 4.5, 5.2
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  private update(deltaTime: number): void {
    if (!this.bird || !this.obstacleManager) return;

    // Update bird physics
    this.bird.update(deltaTime);

    // Update obstacles
    this.obstacleManager.updateObstacles(deltaTime);

    // Check for score updates
    // Validates Requirement 5.2: Increment score when bird passes through pipe gap
    this.checkScoring();

    // Check collisions every frame during gameplay
    // Validates Requirement 4.5: Check for collisions every frame during active gameplay
    this.checkCollisions();
  }

  /**
   * Check if bird has passed obstacles and update score
   * Validates Requirement 5.2: Increment score when bird passes through pipe gap
   */
  private checkScoring(): void {
    if (!this.bird || !this.obstacleManager) return;

    const obstacles = this.obstacleManager.getObstacles();
    for (const obstacle of obstacles) {
      // Check if bird has passed this obstacle and it hasn't been scored yet
      if (!obstacle.isPassed() && this.collisionDetector.checkBirdPassedObstacle(this.bird, obstacle)) {
        obstacle.markAsPassed();
        this.scoreManager.incrementScore();
      }
    }
  }

  /**
   * Check for collisions and trigger game over if detected
   * Validates Requirements: 4.1, 4.2, 4.3, 6.3
   */
  private checkCollisions(): void {
    if (!this.bird || !this.obstacleManager) return;

    // Check boundary collisions
    // Validates Requirements 4.2, 4.3: Detect bird touching ground or ceiling
    if (this.collisionDetector.checkBirdBoundaryCollision(this.bird, this.canvasBounds)) {
      this.gameOver();
      return;
    }

    // Check pipe collisions
    // Validates Requirement 4.1: Detect bird intersection with pipe segments
    const obstacles = this.obstacleManager.getObstacles();
    for (const obstacle of obstacles) {
      if (this.collisionDetector.checkBirdPipeCollision(this.bird, obstacle)) {
        this.gameOver();
        return;
      }
    }
  }

  /**
   * Render the current game state
   * Validates Requirements: 5.1, 5.4, 8.1, 8.2
   * @param interpolation - Interpolation factor for smooth rendering (0-1)
   */
  private render(interpolation: number): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.fillStyle = GAME_CONFIG.CANVAS.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render obstacles
    if (this.obstacleManager) {
      this.obstacleManager.render(this.ctx);
    }

    // Render bird
    if (this.bird) {
      this.bird.render(this.ctx);
    }

    // Render score
    // Validates Requirement 5.1: Display score in top right corner
    this.scoreManager.render(this.ctx, this.canvas.width);

    // Render ready screen if in READY state
    if (this.state === GameState.READY) {
      this.renderReadyScreen();
    }

    // Render game over screen if in GAME_OVER state
    // Validates Requirements 5.4, 8.1, 8.2: Display game over screen with score
    if (this.state === GameState.GAME_OVER) {
      this.scoreManager.renderGameOverScore(this.ctx, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Render the ready screen with instructions
   */
  private renderReadyScreen(): void {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FLAPPY BIRD', centerX, centerY - 80);

    // Instructions
    ctx.font = '24px Arial';
    ctx.fillText('Click, Tap, or Press SPACE to Start', centerX, centerY);
    ctx.fillText('Click/Tap/Space to Flap', centerX, centerY + 40);

    // High score
    const highScore = this.scoreManager.getHighScore();
    if (highScore > 0) {
      ctx.font = '20px Arial';
      ctx.fillText(`High Score: ${highScore}`, centerX, centerY + 100);
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopGameLoop();
    if (this.inputHandler) {
      this.inputHandler.destroy();
    }
    this.canvas = null;
    this.ctx = null;
  }
}
