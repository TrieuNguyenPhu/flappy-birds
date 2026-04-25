/**
 * Bird - Player-controlled character entity
 * 
 * Validates Requirements: 1.1, 1.3, 1.4, 7.2, 7.5, 8.4
 */

import { Vector2D, Rectangle } from '@/shared/types';
import { PhysicsSystem, PhysicsObject } from '@/infrastructure/engine/PhysicsSystem';

/**
 * Bird configuration constants
 */
export const BIRD_CONFIG = {
  START_X: 150, // Starting X position
  START_Y: 300, // Starting Y position (center of 600px canvas)
  WIDTH: 34, // Bird width in pixels
  HEIGHT: 24, // Bird height in pixels
  MAX_ROTATION: 90, // Maximum rotation angle in degrees
  ROTATION_SPEED: 3, // Rotation speed in degrees per frame
  ANIMATION_FRAME_DURATION: 100, // Duration of each animation frame in ms
  ANIMATION_FRAME_COUNT: 3, // Number of animation frames
  FLAP_EFFECT_DURATION: 150, // Duration of flap visual effect in ms
} as const;

/**
 * Bird class represents the player-controlled character
 */
export class Bird implements PhysicsObject {
  public position: Vector2D;
  public velocity: Vector2D;
  public acceleration: Vector2D;
  public rotation: number;
  public bounds: Rectangle;

  private readonly physicsSystem: PhysicsSystem;
  private readonly startX: number;
  private readonly startY: number;
  private readonly width: number;
  private readonly height: number;
  private readonly maxRotation: number;
  private readonly rotationSpeed: number;

  // Animation properties
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private readonly animationFrameDuration: number;
  private readonly animationFrameCount: number;

  // Flap effect properties
  private flapEffectActive: boolean = false;
  private flapEffectTimer: number = 0;
  private readonly flapEffectDuration: number;

  constructor(
    physicsSystem: PhysicsSystem,
    startX: number = BIRD_CONFIG.START_X,
    startY: number = BIRD_CONFIG.START_Y,
    width: number = BIRD_CONFIG.WIDTH,
    height: number = BIRD_CONFIG.HEIGHT
  ) {
    this.physicsSystem = physicsSystem;
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.maxRotation = BIRD_CONFIG.MAX_ROTATION;
    this.rotationSpeed = BIRD_CONFIG.ROTATION_SPEED;
    this.animationFrameDuration = BIRD_CONFIG.ANIMATION_FRAME_DURATION;
    this.animationFrameCount = BIRD_CONFIG.ANIMATION_FRAME_COUNT;
    this.flapEffectDuration = BIRD_CONFIG.FLAP_EFFECT_DURATION;

    // Initialize position, velocity, and acceleration
    this.position = { x: startX, y: startY };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.rotation = 0;

    // Initialize bounding box
    this.bounds = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Apply flap force to make the bird move upward
   * Validates Requirement 1.3: Bird moves upward with initial velocity on flap input
   * Validates Requirement 7.5: Display visual effect when bird flaps
   */
  public flap(): void {
    this.physicsSystem.applyFlap(this);
    // Activate flap visual effect
    this.flapEffectActive = true;
    this.flapEffectTimer = 0;
  }

  /**
   * Update bird state based on physics and time
   * Validates Requirements: 1.1, 1.4, 7.2
   * 
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    // Apply gravity to the bird
    this.physicsSystem.applyGravity(this, deltaTime);

    // Update position based on velocity
    this.physicsSystem.updatePosition(this, deltaTime);

    // Update rotation based on velocity
    this.updateRotation();

    // Update animation frame
    this.updateAnimation(deltaTime);

    // Update flap effect timer
    this.updateFlapEffect(deltaTime);

    // Update bounding box
    this.updateBounds();
  }

  /**
   * Reset bird to initial state for game restart
   * Validates Requirement 8.4: Reset Bird position to starting location on restart
   */
  public reset(): void {
    this.position.x = this.startX;
    this.position.y = this.startY;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.acceleration.x = 0;
    this.acceleration.y = 0;
    this.rotation = 0;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.flapEffectActive = false;
    this.flapEffectTimer = 0;
    this.updateBounds();
  }

  /**
   * Update rotation based on vertical velocity
   * Bird tilts up when moving upward, down when falling
   */
  private updateRotation(): void {
    if (this.velocity.y < 0) {
      // Moving upward - tilt up
      this.rotation = Math.max(-this.maxRotation, this.rotation - this.rotationSpeed);
    } else {
      // Falling - tilt down
      this.rotation = Math.min(this.maxRotation, this.rotation + this.rotationSpeed);
    }
  }

  /**
   * Update animation frame cycling
   * Validates Requirement 7.2: Animated sprite frames that cycle during flight
   * 
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  private updateAnimation(deltaTime: number): void {
    this.animationTimer += deltaTime;

    // Cycle to next frame when timer exceeds duration
    if (this.animationTimer >= this.animationFrameDuration) {
      this.animationFrame = (this.animationFrame + 1) % this.animationFrameCount;
      this.animationTimer = 0;
    }
  }

  /**
   * Update flap effect timer
   * Validates Requirement 7.5: Display brief visual effect when bird flaps
   * 
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  private updateFlapEffect(deltaTime: number): void {
    if (this.flapEffectActive) {
      this.flapEffectTimer += deltaTime;

      // Deactivate effect after duration expires
      if (this.flapEffectTimer >= this.flapEffectDuration) {
        this.flapEffectActive = false;
        this.flapEffectTimer = 0;
      }
    }
  }

  /**
   * Update bounding box to match current position
   */
  private updateBounds(): void {
    this.bounds.x = this.position.x;
    this.bounds.y = this.position.y;
  }

  /**
   * Get the current bounding box for collision detection
   */
  public getBounds(): Rectangle {
    return this.bounds;
  }

  /**
   * Get the current position
   */
  public getPosition(): Vector2D {
    return this.position;
  }

  /**
   * Get the current rotation angle
   */
  public getRotation(): number {
    return this.rotation;
  }

  /**
   * Get the current animation frame index
   * Validates Requirement 7.2: Sprite animation cycling
   */
  public getAnimationFrame(): number {
    return this.animationFrame;
  }

  /**
   * Check if flap effect is currently active
   * Validates Requirement 7.5: Flap visual effect
   */
  public isFlapEffectActive(): boolean {
    return this.flapEffectActive;
  }

  /**
   * Get flap effect progress (0 to 1)
   * Used for rendering flap effect intensity
   */
  public getFlapEffectProgress(): number {
    if (!this.flapEffectActive) return 0;
    return 1 - (this.flapEffectTimer / this.flapEffectDuration);
  }

  /**
   * Render the bird on the canvas
   * Validates Requirements: 7.2, 7.5
   * 
   * @param ctx - Canvas rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Translate to bird position
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);

    // Apply rotation
    ctx.rotate((this.rotation * Math.PI) / 180);

    // Draw flap effect if active
    if (this.flapEffectActive) {
      this.renderFlapEffect(ctx);
    }

    // Draw bird body with animation frame color variation
    this.renderBirdBody(ctx);

    ctx.restore();
  }

  /**
   * Render the bird body with animation frame variation
   * Validates Requirement 7.2: Animated sprite frames
   * 
   * @param ctx - Canvas rendering context
   */
  private renderBirdBody(ctx: CanvasRenderingContext2D): void {
    // Color variations for different animation frames
    const colors = ['#FFD700', '#FFC700', '#FFB700']; // Gold shades
    const color = colors[this.animationFrame];

    // Draw bird body (simple oval shape)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird outline
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.width / 4, -this.height / 6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2 + 8, -3);
    ctx.lineTo(this.width / 2 + 8, 3);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Render the flap visual effect
   * Validates Requirement 7.5: Brief visual effect when bird flaps
   * 
   * @param ctx - Canvas rendering context
   */
  private renderFlapEffect(ctx: CanvasRenderingContext2D): void {
    const progress = this.getFlapEffectProgress();
    const radius = this.width * (1 + progress * 0.5);
    const alpha = progress * 0.3;

    // Draw expanding circle effect
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
