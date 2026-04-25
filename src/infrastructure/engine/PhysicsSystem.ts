/**
 * PhysicsSystem - Handles gravity, velocity, acceleration, and movement calculations
 * 
 * Validates Requirements: 1.2, 1.3, 1.4
 */

import { Vector2D } from '@/shared/types';

/**
 * Physics configuration constants
 */
export const PHYSICS_CONFIG = {
  GRAVITY: 0.0008, // Gravity acceleration in pixels/ms²
  FLAP_FORCE: -0.45, // Upward velocity applied on flap in pixels/ms
  TERMINAL_VELOCITY: 0.8, // Maximum downward velocity in pixels/ms
  HORIZONTAL_SPEED: 0.2, // Constant horizontal movement speed in pixels/ms
} as const;

/**
 * Interface for objects that can be affected by physics
 */
export interface PhysicsObject {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
}

/**
 * PhysicsSystem class manages all physics calculations for the game
 */
export class PhysicsSystem {
  private readonly gravity: number;
  private readonly flapForce: number;
  private readonly terminalVelocity: number;

  constructor(
    gravity: number = PHYSICS_CONFIG.GRAVITY,
    flapForce: number = PHYSICS_CONFIG.FLAP_FORCE,
    terminalVelocity: number = PHYSICS_CONFIG.TERMINAL_VELOCITY
  ) {
    this.gravity = gravity;
    this.flapForce = flapForce;
    this.terminalVelocity = terminalVelocity;
  }

  /**
   * Apply gravity to an object over time
   * Validates Requirement 1.2: Continuously apply downward force to the Bird
   * 
   * @param object - The physics object to apply gravity to
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public applyGravity(object: PhysicsObject, deltaTime: number): void {
    // Apply gravity acceleration
    object.acceleration.y = this.gravity;
    
    // Update velocity based on acceleration
    object.velocity.y += object.acceleration.y * deltaTime;
    
    // Clamp velocity to terminal velocity
    if (object.velocity.y > this.terminalVelocity) {
      object.velocity.y = this.terminalVelocity;
    }
  }

  /**
   * Apply flap force to an object (upward movement)
   * Validates Requirement 1.3: Bird moves upward with initial velocity on flap input
   * 
   * @param object - The physics object to apply flap force to
   */
  public applyFlap(object: PhysicsObject): void {
    // Set upward velocity (negative Y is up)
    object.velocity.y = this.flapForce;
    
    // Reset acceleration
    object.acceleration.y = 0;
  }

  /**
   * Update position based on velocity and time
   * Validates Requirement 1.4: Bird has realistic physics with velocity and acceleration
   * 
   * @param object - The physics object to update position for
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public updatePosition(object: PhysicsObject, deltaTime: number): void {
    // Update position based on velocity
    object.position.x += object.velocity.x * deltaTime;
    object.position.y += object.velocity.y * deltaTime;
  }

  /**
   * Get the current gravity value
   */
  public getGravity(): number {
    return this.gravity;
  }

  /**
   * Get the flap force value
   */
  public getFlapForce(): number {
    return this.flapForce;
  }

  /**
   * Get the terminal velocity value
   */
  public getTerminalVelocity(): number {
    return this.terminalVelocity;
  }
}
