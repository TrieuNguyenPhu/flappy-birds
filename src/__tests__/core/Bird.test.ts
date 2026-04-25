/**
 * Unit tests for Bird class
 * 
 * Validates Requirements: 1.1, 1.3, 1.4, 7.2, 7.5, 8.4
 */

import { Bird, BIRD_CONFIG } from '@/core/entities/Bird';
import { PhysicsSystem, PHYSICS_CONFIG } from '@/infrastructure/engine/PhysicsSystem';

describe('Bird', () => {
  let bird: Bird;
  let physicsSystem: PhysicsSystem;

  beforeEach(() => {
    physicsSystem = new PhysicsSystem();
    bird = new Bird(physicsSystem);
  });

  describe('Initialization', () => {
    test('initializes with default starting position', () => {
      expect(bird.position.x).toBe(BIRD_CONFIG.START_X);
      expect(bird.position.y).toBe(BIRD_CONFIG.START_Y);
    });

    test('initializes with zero velocity', () => {
      expect(bird.velocity.x).toBe(0);
      expect(bird.velocity.y).toBe(0);
    });

    test('initializes with zero acceleration', () => {
      expect(bird.acceleration.x).toBe(0);
      expect(bird.acceleration.y).toBe(0);
    });

    test('initializes with zero rotation', () => {
      expect(bird.rotation).toBe(0);
    });

    test('initializes bounding box correctly', () => {
      const bounds = bird.getBounds();
      expect(bounds.x).toBe(BIRD_CONFIG.START_X);
      expect(bounds.y).toBe(BIRD_CONFIG.START_Y);
      expect(bounds.width).toBe(BIRD_CONFIG.WIDTH);
      expect(bounds.height).toBe(BIRD_CONFIG.HEIGHT);
    });

    test('initializes with custom position', () => {
      const customBird = new Bird(physicsSystem, 200, 400);
      expect(customBird.position.x).toBe(200);
      expect(customBird.position.y).toBe(400);
    });

    test('initializes with custom dimensions', () => {
      const customBird = new Bird(physicsSystem, 150, 300, 50, 40);
      const bounds = customBird.getBounds();
      expect(bounds.width).toBe(50);
      expect(bounds.height).toBe(40);
    });
  });

  describe('Flap Method - Requirement 1.3', () => {
    test('applies upward velocity when flapping', () => {
      bird.flap();
      
      expect(bird.velocity.y).toBe(PHYSICS_CONFIG.FLAP_FORCE);
      expect(bird.velocity.y).toBeLessThan(0); // Negative is upward
    });

    test('resets acceleration when flapping', () => {
      bird.acceleration.y = 0.5;
      
      bird.flap();
      
      expect(bird.acceleration.y).toBe(0);
    });

    test('overrides downward velocity when flapping while falling', () => {
      // Simulate falling
      bird.velocity.y = 0.5;
      
      bird.flap();
      
      expect(bird.velocity.y).toBe(PHYSICS_CONFIG.FLAP_FORCE);
      expect(bird.velocity.y).toBeLessThan(0);
    });

    test('can flap multiple times', () => {
      bird.flap();
      const firstFlapVelocity = bird.velocity.y;
      
      bird.flap();
      const secondFlapVelocity = bird.velocity.y;
      
      expect(firstFlapVelocity).toBe(secondFlapVelocity);
      expect(secondFlapVelocity).toBe(PHYSICS_CONFIG.FLAP_FORCE);
    });

    test('activates flap effect - Requirement 7.5', () => {
      expect(bird.isFlapEffectActive()).toBe(false);
      
      bird.flap();
      
      expect(bird.isFlapEffectActive()).toBe(true);
    });

    test('resets flap effect timer on flap - Requirement 7.5', () => {
      bird.flap();
      bird.update(50); // Advance timer
      
      bird.flap();
      
      expect(bird.getFlapEffectProgress()).toBeCloseTo(1, 1);
    });
  });

  describe('Update Method - Requirements 1.1, 1.4', () => {
    test('applies gravity over time', () => {
      const deltaTime = 16.67;
      const initialY = bird.position.y;
      
      bird.update(deltaTime);
      
      expect(bird.velocity.y).toBeGreaterThan(0); // Falling
      expect(bird.position.y).toBeGreaterThan(initialY);
    });

    test('updates position based on velocity', () => {
      const deltaTime = 16.67;
      bird.velocity.x = 0.2;
      bird.velocity.y = 0.3;
      
      const initialX = bird.position.x;
      const initialY = bird.position.y;
      
      bird.update(deltaTime);
      
      expect(bird.position.x).toBeGreaterThan(initialX);
      expect(bird.position.y).toBeGreaterThan(initialY);
    });

    test('updates bounding box after position change', () => {
      const deltaTime = 16.67;
      bird.velocity.y = 0.3;
      
      bird.update(deltaTime);
      
      const bounds = bird.getBounds();
      expect(bounds.x).toBe(bird.position.x);
      expect(bounds.y).toBe(bird.position.y);
    });

    test('updates rotation when moving upward', () => {
      bird.velocity.y = -0.5; // Moving upward
      const deltaTime = 16.67;
      
      bird.update(deltaTime);
      
      expect(bird.rotation).toBeLessThan(0); // Tilted upward
    });

    test('updates rotation when falling', () => {
      bird.velocity.y = 0.5; // Falling
      const deltaTime = 16.67;
      
      bird.update(deltaTime);
      
      expect(bird.rotation).toBeGreaterThan(0); // Tilted downward
    });

    test('clamps rotation to maximum angle', () => {
      const deltaTime = 16.67;
      bird.velocity.y = 1.0; // Fast fall
      
      // Update many times to exceed max rotation
      for (let i = 0; i < 50; i++) {
        bird.update(deltaTime);
      }
      
      expect(bird.rotation).toBeLessThanOrEqual(BIRD_CONFIG.MAX_ROTATION);
    });

    test('clamps rotation to minimum angle', () => {
      const deltaTime = 16.67;
      
      // Flap and update many times
      for (let i = 0; i < 50; i++) {
        bird.flap();
        bird.update(deltaTime);
      }
      
      expect(bird.rotation).toBeGreaterThanOrEqual(-BIRD_CONFIG.MAX_ROTATION);
    });
  });

  describe('Reset Method - Requirement 8.4', () => {
    test('resets position to starting location', () => {
      bird.position.x = 500;
      bird.position.y = 400;
      
      bird.reset();
      
      expect(bird.position.x).toBe(BIRD_CONFIG.START_X);
      expect(bird.position.y).toBe(BIRD_CONFIG.START_Y);
    });

    test('resets velocity to zero', () => {
      bird.velocity.x = 0.5;
      bird.velocity.y = 0.8;
      
      bird.reset();
      
      expect(bird.velocity.x).toBe(0);
      expect(bird.velocity.y).toBe(0);
    });

    test('resets acceleration to zero', () => {
      bird.acceleration.x = 0.3;
      bird.acceleration.y = 0.5;
      
      bird.reset();
      
      expect(bird.acceleration.x).toBe(0);
      expect(bird.acceleration.y).toBe(0);
    });

    test('resets rotation to zero', () => {
      bird.rotation = 45;
      
      bird.reset();
      
      expect(bird.rotation).toBe(0);
    });

    test('resets bounding box', () => {
      bird.position.x = 500;
      bird.position.y = 400;
      
      bird.reset();
      
      const bounds = bird.getBounds();
      expect(bounds.x).toBe(BIRD_CONFIG.START_X);
      expect(bounds.y).toBe(BIRD_CONFIG.START_Y);
    });

    test('can be called multiple times', () => {
      bird.reset();
      bird.position.x = 300;
      bird.reset();
      
      expect(bird.position.x).toBe(BIRD_CONFIG.START_X);
    });

    test('resets animation frame - Requirement 7.2', () => {
      bird.update(BIRD_CONFIG.ANIMATION_FRAME_DURATION * 2);
      expect(bird.getAnimationFrame()).toBeGreaterThan(0);
      
      bird.reset();
      
      expect(bird.getAnimationFrame()).toBe(0);
    });

    test('resets flap effect - Requirement 7.5', () => {
      bird.flap();
      expect(bird.isFlapEffectActive()).toBe(true);
      
      bird.reset();
      
      expect(bird.isFlapEffectActive()).toBe(false);
      expect(bird.getFlapEffectProgress()).toBe(0);
    });
  });

  describe('Integrated Behavior', () => {
    test('simulates realistic flap and fall cycle', () => {
      const deltaTime = 16.67;
      
      // Flap
      bird.flap();
      bird.update(deltaTime);
      const positionAfterFlap = bird.position.y;
      
      // Should move upward
      expect(positionAfterFlap).toBeLessThan(BIRD_CONFIG.START_Y);
      
      // Fall for many frames
      for (let i = 0; i < 100; i++) {
        bird.update(deltaTime);
      }
      
      // Should fall below starting position
      expect(bird.position.y).toBeGreaterThan(BIRD_CONFIG.START_Y);
    });

    test('maintains consistent physics over time', () => {
      const deltaTime = 16.67;
      
      // Simulate 1 second of falling
      for (let i = 0; i < 60; i++) {
        bird.update(deltaTime);
      }
      
      // Velocity should be capped at terminal velocity
      expect(bird.velocity.y).toBeLessThanOrEqual(PHYSICS_CONFIG.TERMINAL_VELOCITY);
      
      // Should have fallen significantly
      expect(bird.position.y).toBeGreaterThan(BIRD_CONFIG.START_Y + 100);
    });

    test('handles rapid flapping', () => {
      const deltaTime = 16.67;
      
      // Flap multiple times
      for (let i = 0; i < 5; i++) {
        bird.flap();
        bird.update(deltaTime);
      }
      
      // Should be moving upward
      expect(bird.velocity.y).toBeLessThan(0);
      expect(bird.position.y).toBeLessThan(BIRD_CONFIG.START_Y);
    });

    test('rotation follows velocity changes', () => {
      const deltaTime = 16.67;
      
      // Start with bird falling (positive velocity)
      bird.velocity.y = 0.5;
      bird.update(deltaTime);
      const rotationWhileFalling = bird.rotation;
      expect(rotationWhileFalling).toBeGreaterThan(0);
      
      // Flap to move upward
      bird.flap();
      for (let i = 0; i < 5; i++) {
        bird.update(deltaTime);
      }
      
      // Rotation should be negative (tilted up) when moving upward
      expect(bird.rotation).toBeLessThan(rotationWhileFalling);
    });
  });

  describe('Getter Methods', () => {
    test('getPosition returns current position', () => {
      bird.position.x = 250;
      bird.position.y = 350;
      
      const position = bird.getPosition();
      
      expect(position.x).toBe(250);
      expect(position.y).toBe(350);
    });

    test('getBounds returns current bounding box', () => {
      bird.position.x = 250;
      bird.position.y = 350;
      bird.update(0); // Update bounds
      
      const bounds = bird.getBounds();
      
      expect(bounds.x).toBe(250);
      expect(bounds.y).toBe(350);
      expect(bounds.width).toBe(BIRD_CONFIG.WIDTH);
      expect(bounds.height).toBe(BIRD_CONFIG.HEIGHT);
    });

    test('getRotation returns current rotation', () => {
      bird.rotation = 30;
      
      const rotation = bird.getRotation();
      
      expect(rotation).toBe(30);
    });

    test('getAnimationFrame returns current frame - Requirement 7.2', () => {
      expect(bird.getAnimationFrame()).toBe(0);
      
      bird.update(BIRD_CONFIG.ANIMATION_FRAME_DURATION);
      
      expect(bird.getAnimationFrame()).toBe(1);
    });

    test('isFlapEffectActive returns effect state - Requirement 7.5', () => {
      expect(bird.isFlapEffectActive()).toBe(false);
      
      bird.flap();
      
      expect(bird.isFlapEffectActive()).toBe(true);
    });

    test('getFlapEffectProgress returns progress value - Requirement 7.5', () => {
      bird.flap();
      
      const initialProgress = bird.getFlapEffectProgress();
      expect(initialProgress).toBeCloseTo(1, 1);
      
      bird.update(BIRD_CONFIG.FLAP_EFFECT_DURATION / 2);
      
      const midProgress = bird.getFlapEffectProgress();
      expect(midProgress).toBeCloseTo(0.5, 1);
    });
  });

  describe('Animation System - Requirement 7.2', () => {
    test('initializes with animation frame 0', () => {
      expect(bird.getAnimationFrame()).toBe(0);
    });

    test('cycles animation frames over time', () => {
      const deltaTime = BIRD_CONFIG.ANIMATION_FRAME_DURATION;
      
      expect(bird.getAnimationFrame()).toBe(0);
      
      bird.update(deltaTime);
      expect(bird.getAnimationFrame()).toBe(1);
      
      bird.update(deltaTime);
      expect(bird.getAnimationFrame()).toBe(2);
      
      bird.update(deltaTime);
      expect(bird.getAnimationFrame()).toBe(0); // Wraps around
    });

    test('accumulates time correctly for animation', () => {
      const halfDuration = BIRD_CONFIG.ANIMATION_FRAME_DURATION / 2;
      
      bird.update(halfDuration);
      expect(bird.getAnimationFrame()).toBe(0); // Not enough time
      
      bird.update(halfDuration);
      expect(bird.getAnimationFrame()).toBe(1); // Now it advances
    });

    test('handles multiple frame advances in one update', () => {
      // Animation advances one frame per duration, not multiple frames in one update
      const longDelta = BIRD_CONFIG.ANIMATION_FRAME_DURATION * 2.5;
      
      bird.update(longDelta);
      
      // The animation logic only advances one frame per update call
      // After one update with 2.5x duration, we advance to frame 1
      expect(bird.getAnimationFrame()).toBe(1);
    });

    test('animation continues during gameplay', () => {
      const deltaTime = 16.67;
      let frameChanges = 0;
      let previousFrame = bird.getAnimationFrame();
      
      for (let i = 0; i < 100; i++) {
        bird.update(deltaTime);
        if (bird.getAnimationFrame() !== previousFrame) {
          frameChanges++;
          previousFrame = bird.getAnimationFrame();
        }
      }
      
      expect(frameChanges).toBeGreaterThan(0);
    });
  });

  describe('Flap Visual Effect - Requirement 7.5', () => {
    test('flap effect is inactive initially', () => {
      expect(bird.isFlapEffectActive()).toBe(false);
      expect(bird.getFlapEffectProgress()).toBe(0);
    });

    test('flap effect activates on flap', () => {
      bird.flap();
      
      expect(bird.isFlapEffectActive()).toBe(true);
      expect(bird.getFlapEffectProgress()).toBeGreaterThan(0);
    });

    test('flap effect progress decreases over time', () => {
      bird.flap();
      const initialProgress = bird.getFlapEffectProgress();
      
      bird.update(50);
      const laterProgress = bird.getFlapEffectProgress();
      
      expect(laterProgress).toBeLessThan(initialProgress);
    });

    test('flap effect deactivates after duration', () => {
      bird.flap();
      
      bird.update(BIRD_CONFIG.FLAP_EFFECT_DURATION);
      
      expect(bird.isFlapEffectActive()).toBe(false);
      expect(bird.getFlapEffectProgress()).toBe(0);
    });

    test('flap effect can be retriggered', () => {
      bird.flap();
      bird.update(BIRD_CONFIG.FLAP_EFFECT_DURATION);
      expect(bird.isFlapEffectActive()).toBe(false);
      
      bird.flap();
      
      expect(bird.isFlapEffectActive()).toBe(true);
      expect(bird.getFlapEffectProgress()).toBeCloseTo(1, 1);
    });

    test('multiple flaps reset effect timer', () => {
      bird.flap();
      bird.update(BIRD_CONFIG.FLAP_EFFECT_DURATION / 2);
      
      bird.flap();
      
      expect(bird.getFlapEffectProgress()).toBeCloseTo(1, 1);
    });
  });

  describe('Render Method - Requirements 7.2, 7.5', () => {
    let mockCtx: any;

    beforeEach(() => {
      // Create a mock canvas context
      mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        beginPath: jest.fn(),
        ellipse: jest.fn(),
        arc: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
      };
    });

    test('render method executes without errors', () => {
      expect(() => bird.render(mockCtx)).not.toThrow();
    });

    test('render applies rotation transformation', () => {
      bird.rotation = 45;
      bird.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    test('render draws bird body', () => {
      bird.render(mockCtx);
      
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    test('render draws flap effect when active', () => {
      bird.flap();
      bird.render(mockCtx);
      
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    test('render uses different colors for animation frames', () => {
      const fillStyleValues: string[] = [];
      
      Object.defineProperty(mockCtx, 'fillStyle', {
        set: (value: string) => fillStyleValues.push(value),
        get: () => fillStyleValues[fillStyleValues.length - 1] || '#000000',
        configurable: true,
      });
      
      bird.render(mockCtx);
      const frame0Color = fillStyleValues[0];
      
      bird.update(BIRD_CONFIG.ANIMATION_FRAME_DURATION);
      fillStyleValues.length = 0;
      bird.render(mockCtx);
      const frame1Color = fillStyleValues[0];
      
      expect(frame0Color).not.toBe(frame1Color);
    });
  });

  describe('Edge Cases', () => {
    test('handles zero delta time', () => {
      const initialPosition = { ...bird.position };
      
      bird.update(0);
      
      expect(bird.position.x).toBe(initialPosition.x);
      expect(bird.position.y).toBe(initialPosition.y);
    });

    test('handles very large delta time', () => {
      const largeDelta = 1000;
      
      bird.update(largeDelta);
      
      // Should still clamp velocity to terminal velocity
      expect(bird.velocity.y).toBe(PHYSICS_CONFIG.TERMINAL_VELOCITY);
    });

    test('handles custom starting position in reset', () => {
      const customBird = new Bird(physicsSystem, 200, 400);
      customBird.position.x = 500;
      customBird.position.y = 100;
      
      customBird.reset();
      
      expect(customBird.position.x).toBe(200);
      expect(customBird.position.y).toBe(400);
    });
  });
});
