/**
 * Unit tests for PhysicsSystem class
 * 
 * Validates Requirements: 1.2, 1.3, 1.4
 */

import { PhysicsSystem, PHYSICS_CONFIG, PhysicsObject } from '@/infrastructure/engine/PhysicsSystem';

describe('PhysicsSystem', () => {
  let physics: PhysicsSystem;
  let testObject: PhysicsObject;

  beforeEach(() => {
    physics = new PhysicsSystem();
    testObject = {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
    };
  });

  describe('Initialization', () => {
    test('initializes with default physics constants', () => {
      expect(physics.getGravity()).toBe(PHYSICS_CONFIG.GRAVITY);
      expect(physics.getFlapForce()).toBe(PHYSICS_CONFIG.FLAP_FORCE);
      expect(physics.getTerminalVelocity()).toBe(PHYSICS_CONFIG.TERMINAL_VELOCITY);
    });

    test('initializes with custom physics constants', () => {
      const customPhysics = new PhysicsSystem(0.001, -0.5, 1.0);
      expect(customPhysics.getGravity()).toBe(0.001);
      expect(customPhysics.getFlapForce()).toBe(-0.5);
      expect(customPhysics.getTerminalVelocity()).toBe(1.0);
    });
  });

  describe('Gravity Application - Requirement 1.2', () => {
    test('applies gravity acceleration to object', () => {
      const deltaTime = 16.67; // ~60fps frame time
      
      physics.applyGravity(testObject, deltaTime);
      
      expect(testObject.acceleration.y).toBe(PHYSICS_CONFIG.GRAVITY);
      expect(testObject.velocity.y).toBeGreaterThan(0);
    });

    test('increases velocity over multiple frames', () => {
      const deltaTime = 16.67;
      
      physics.applyGravity(testObject, deltaTime);
      const velocityAfterFrame1 = testObject.velocity.y;
      
      physics.applyGravity(testObject, deltaTime);
      const velocityAfterFrame2 = testObject.velocity.y;
      
      expect(velocityAfterFrame2).toBeGreaterThan(velocityAfterFrame1);
    });

    test('clamps velocity to terminal velocity', () => {
      const deltaTime = 16.67;
      
      // Apply gravity many times to exceed terminal velocity
      for (let i = 0; i < 100; i++) {
        physics.applyGravity(testObject, deltaTime);
      }
      
      expect(testObject.velocity.y).toBe(PHYSICS_CONFIG.TERMINAL_VELOCITY);
    });

    test('applies gravity proportional to delta time', () => {
      const shortDelta = 8;
      const longDelta = 32;
      
      const object1: PhysicsObject = {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
      };
      
      const object2: PhysicsObject = {
        position: { x: 100, y: 100 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
      };
      
      physics.applyGravity(object1, shortDelta);
      physics.applyGravity(object2, longDelta);
      
      expect(object2.velocity.y).toBeGreaterThan(object1.velocity.y);
    });
  });

  describe('Flap Force Application - Requirement 1.3', () => {
    test('applies upward velocity on flap', () => {
      physics.applyFlap(testObject);
      
      expect(testObject.velocity.y).toBe(PHYSICS_CONFIG.FLAP_FORCE);
      expect(testObject.velocity.y).toBeLessThan(0); // Negative is upward
    });

    test('resets acceleration on flap', () => {
      testObject.acceleration.y = 0.5;
      
      physics.applyFlap(testObject);
      
      expect(testObject.acceleration.y).toBe(0);
    });

    test('overrides existing downward velocity', () => {
      testObject.velocity.y = 0.5; // Falling down
      
      physics.applyFlap(testObject);
      
      expect(testObject.velocity.y).toBe(PHYSICS_CONFIG.FLAP_FORCE);
      expect(testObject.velocity.y).toBeLessThan(0);
    });

    test('can be applied multiple times', () => {
      physics.applyFlap(testObject);
      const firstFlapVelocity = testObject.velocity.y;
      
      physics.applyFlap(testObject);
      const secondFlapVelocity = testObject.velocity.y;
      
      expect(firstFlapVelocity).toBe(secondFlapVelocity);
      expect(secondFlapVelocity).toBe(PHYSICS_CONFIG.FLAP_FORCE);
    });
  });

  describe('Position Updates - Requirement 1.4', () => {
    test('updates position based on velocity', () => {
      testObject.velocity.x = 0.2;
      testObject.velocity.y = 0.3;
      const deltaTime = 16.67;
      
      const initialX = testObject.position.x;
      const initialY = testObject.position.y;
      
      physics.updatePosition(testObject, deltaTime);
      
      expect(testObject.position.x).toBeGreaterThan(initialX);
      expect(testObject.position.y).toBeGreaterThan(initialY);
    });

    test('updates position proportional to delta time', () => {
      testObject.velocity.x = 0.2;
      testObject.velocity.y = 0.3;
      
      const object1: PhysicsObject = {
        position: { x: 100, y: 100 },
        velocity: { x: 0.2, y: 0.3 },
        acceleration: { x: 0, y: 0 },
      };
      
      const object2: PhysicsObject = {
        position: { x: 100, y: 100 },
        velocity: { x: 0.2, y: 0.3 },
        acceleration: { x: 0, y: 0 },
      };
      
      physics.updatePosition(object1, 10);
      physics.updatePosition(object2, 20);
      
      const distance1 = Math.sqrt(
        Math.pow(object1.position.x - 100, 2) + Math.pow(object1.position.y - 100, 2)
      );
      const distance2 = Math.sqrt(
        Math.pow(object2.position.x - 100, 2) + Math.pow(object2.position.y - 100, 2)
      );
      
      expect(distance2).toBeGreaterThan(distance1);
    });

    test('handles zero velocity', () => {
      testObject.velocity.x = 0;
      testObject.velocity.y = 0;
      const deltaTime = 16.67;
      
      const initialX = testObject.position.x;
      const initialY = testObject.position.y;
      
      physics.updatePosition(testObject, deltaTime);
      
      expect(testObject.position.x).toBe(initialX);
      expect(testObject.position.y).toBe(initialY);
    });

    test('handles negative velocity (upward/leftward movement)', () => {
      testObject.velocity.x = -0.2;
      testObject.velocity.y = -0.3;
      const deltaTime = 16.67;
      
      const initialX = testObject.position.x;
      const initialY = testObject.position.y;
      
      physics.updatePosition(testObject, deltaTime);
      
      expect(testObject.position.x).toBeLessThan(initialX);
      expect(testObject.position.y).toBeLessThan(initialY);
    });
  });

  describe('Integrated Physics Simulation - Requirement 1.4', () => {
    test('simulates realistic falling motion', () => {
      const deltaTime = 16.67;
      const positions: number[] = [];
      
      // Simulate falling for several frames
      for (let i = 0; i < 10; i++) {
        physics.applyGravity(testObject, deltaTime);
        physics.updatePosition(testObject, deltaTime);
        positions.push(testObject.position.y);
      }
      
      // Verify object is falling (Y increasing)
      expect(positions[positions.length - 1]).toBeGreaterThan(positions[0]);
      
      // Verify acceleration (each frame moves more than the last initially)
      const firstFrameDistance = positions[1] - positions[0];
      const secondFrameDistance = positions[2] - positions[1];
      expect(secondFrameDistance).toBeGreaterThan(firstFrameDistance);
    });

    test('simulates flap and fall cycle', () => {
      const deltaTime = 16.67;
      
      // Apply flap
      physics.applyFlap(testObject);
      physics.updatePosition(testObject, deltaTime);
      const positionAfterFlap = testObject.position.y;
      
      // Object should move upward
      expect(positionAfterFlap).toBeLessThan(100);
      
      // Apply gravity for many frames (enough to overcome flap and fall back)
      for (let i = 0; i < 100; i++) {
        physics.applyGravity(testObject, deltaTime);
        physics.updatePosition(testObject, deltaTime);
      }
      
      // Object should eventually fall below initial position
      expect(testObject.position.y).toBeGreaterThan(100);
    });

    test('maintains consistent physics over time', () => {
      const deltaTime = 16.67;
      
      // Run simulation for 1 second (60 frames)
      for (let i = 0; i < 60; i++) {
        physics.applyGravity(testObject, deltaTime);
        physics.updatePosition(testObject, deltaTime);
      }
      
      // Verify velocity is capped at terminal velocity
      expect(testObject.velocity.y).toBeLessThanOrEqual(PHYSICS_CONFIG.TERMINAL_VELOCITY);
      
      // Verify object has fallen significantly
      expect(testObject.position.y).toBeGreaterThan(200);
    });

    test('handles rapid flapping', () => {
      const deltaTime = 16.67;
      
      // Flap multiple times in quick succession
      for (let i = 0; i < 5; i++) {
        physics.applyFlap(testObject);
        physics.updatePosition(testObject, deltaTime);
      }
      
      // Object should be moving upward
      expect(testObject.velocity.y).toBeLessThan(0);
      expect(testObject.position.y).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    test('handles zero delta time', () => {
      const initialPosition = { ...testObject.position };
      const initialVelocity = { ...testObject.velocity };
      
      physics.applyGravity(testObject, 0);
      physics.updatePosition(testObject, 0);
      
      expect(testObject.position.x).toBe(initialPosition.x);
      expect(testObject.position.y).toBe(initialPosition.y);
    });

    test('handles very large delta time', () => {
      const largeDelta = 1000; // 1 second
      
      physics.applyGravity(testObject, largeDelta);
      
      // Should still clamp to terminal velocity
      expect(testObject.velocity.y).toBe(PHYSICS_CONFIG.TERMINAL_VELOCITY);
    });

    test('handles object already at terminal velocity', () => {
      testObject.velocity.y = PHYSICS_CONFIG.TERMINAL_VELOCITY;
      const deltaTime = 16.67;
      
      physics.applyGravity(testObject, deltaTime);
      
      expect(testObject.velocity.y).toBe(PHYSICS_CONFIG.TERMINAL_VELOCITY);
    });
  });
});
