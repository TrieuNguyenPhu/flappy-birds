/**
 * CollisionDetector unit tests
 * 
 * Tests Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { CollisionDetector } from '@/infrastructure/engine/CollisionDetector';
import { Bird } from '@/core/entities/Bird';
import { Obstacle } from '@/core/entities/Obstacle';
import { PhysicsSystem } from '@/infrastructure/engine/PhysicsSystem';
import { Rectangle } from '@/shared/types';

describe('CollisionDetector', () => {
  let collisionDetector: CollisionDetector;
  let physicsSystem: PhysicsSystem;
  let bird: Bird;

  beforeEach(() => {
    collisionDetector = new CollisionDetector();
    physicsSystem = new PhysicsSystem();
    bird = new Bird(physicsSystem, 100, 300, 34, 24);
  });

  describe('checkBirdPipeCollision', () => {
    it('should detect collision with top pipe', () => {
      // Create obstacle with gap at y=400
      const obstacle = new Obstacle(120, 400, 600);
      
      // Position bird to collide with top pipe (above gap)
      bird.position.y = 200;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdPipeCollision(bird, obstacle);
      expect(collision).toBe(true);
    });

    it('should detect collision with bottom pipe', () => {
      // Create obstacle with gap at y=200
      const obstacle = new Obstacle(120, 200, 600);
      
      // Position bird to collide with bottom pipe (below gap)
      bird.position.y = 500;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdPipeCollision(bird, obstacle);
      expect(collision).toBe(true);
    });

    it('should not detect collision when bird is in the gap', () => {
      // Create obstacle with gap at y=300
      const obstacle = new Obstacle(120, 300, 600);
      
      // Position bird in the gap
      bird.position.y = 300;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdPipeCollision(bird, obstacle);
      expect(collision).toBe(false);
    });

    it('should not detect collision when bird is far from obstacle', () => {
      const obstacle = new Obstacle(500, 300, 600);
      
      // Bird at x=100, obstacle at x=500
      bird.position.x = 100;
      bird.position.y = 300;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdPipeCollision(bird, obstacle);
      expect(collision).toBe(false);
    });

    it('should detect edge collision accurately', () => {
      const obstacle = new Obstacle(133, 300, 600); // Overlapping bird's right edge by 1px
      
      bird.position.x = 100; // Bird width is 34, so right edge at 134
      bird.position.y = 100; // In top pipe area
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdPipeCollision(bird, obstacle);
      expect(collision).toBe(true);
    });
  });

  describe('checkBirdBoundaryCollision', () => {
    const canvasBounds: Rectangle = { x: 0, y: 0, width: 800, height: 600 };

    it('should detect collision with ground (bottom boundary)', () => {
      // Position bird at bottom
      bird.position.y = 600 - 24; // Canvas height - bird height
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdBoundaryCollision(bird, canvasBounds);
      expect(collision).toBe(true);
    });

    it('should detect collision with ceiling (top boundary)', () => {
      // Position bird at top
      bird.position.y = 0;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdBoundaryCollision(bird, canvasBounds);
      expect(collision).toBe(true);
    });

    it('should detect collision when bird goes below ground', () => {
      // Position bird below canvas
      bird.position.y = 650;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdBoundaryCollision(bird, canvasBounds);
      expect(collision).toBe(true);
    });

    it('should detect collision when bird goes above ceiling', () => {
      // Position bird above canvas
      bird.position.y = -10;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdBoundaryCollision(bird, canvasBounds);
      expect(collision).toBe(true);
    });

    it('should not detect collision when bird is within bounds', () => {
      // Position bird in middle of canvas
      bird.position.y = 300;
      bird['updateBounds']();

      const collision = collisionDetector.checkBirdBoundaryCollision(bird, canvasBounds);
      expect(collision).toBe(false);
    });

    it('should not detect collision when bird is just inside bounds', () => {
      // Position bird just inside top boundary
      bird.position.y = 1;
      bird['updateBounds']();

      let collision = collisionDetector.checkBirdBoundaryCollision(bird, canvasBounds);
      expect(collision).toBe(false);

      // Position bird just inside bottom boundary
      bird.position.y = 600 - 25; // One pixel above collision
      bird['updateBounds']();

      collision = collisionDetector.checkBirdBoundaryCollision(bird, canvasBounds);
      expect(collision).toBe(false);
    });
  });

  describe('checkBirdPassedObstacle', () => {
    it('should return true when bird has passed obstacle', () => {
      const obstacle = new Obstacle(100, 300, 600);
      
      // Position bird past the obstacle (obstacle at x=100, width=80, so right edge at 180)
      bird.position.x = 200;
      bird['updateBounds']();

      const passed = collisionDetector.checkBirdPassedObstacle(bird, obstacle);
      expect(passed).toBe(true);
    });

    it('should return false when bird has not passed obstacle', () => {
      const obstacle = new Obstacle(200, 300, 600);
      
      // Position bird before the obstacle
      bird.position.x = 100;
      bird['updateBounds']();

      const passed = collisionDetector.checkBirdPassedObstacle(bird, obstacle);
      expect(passed).toBe(false);
    });

    it('should return false when bird is aligned with obstacle', () => {
      const obstacle = new Obstacle(100, 300, 600);
      
      // Position bird at same x as obstacle
      bird.position.x = 100;
      bird['updateBounds']();

      const passed = collisionDetector.checkBirdPassedObstacle(bird, obstacle);
      expect(passed).toBe(false);
    });

    it('should return true when bird left edge is just past obstacle right edge', () => {
      const obstacle = new Obstacle(100, 300, 600); // Right edge at 180 (100 + 80)
      
      // Position bird just past obstacle
      bird.position.x = 181;
      bird['updateBounds']();

      const passed = collisionDetector.checkBirdPassedObstacle(bird, obstacle);
      expect(passed).toBe(true);
    });
  });
});
