/**
 * Unit tests for Obstacle class
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { Obstacle, OBSTACLE_CONFIG } from '@/core/entities/Obstacle';

describe('Obstacle', () => {
  const canvasHeight = 600;
  const gapPosition = 300;
  const x = 800;

  describe('constructor', () => {
    it('should create obstacle with correct top and bottom pipe dimensions', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);

      // Top pipe should go from top of canvas to gap start
      expect(obstacle.topPipe.x).toBe(x);
      expect(obstacle.topPipe.y).toBe(0);
      expect(obstacle.topPipe.width).toBe(OBSTACLE_CONFIG.WIDTH);
      expect(obstacle.topPipe.height).toBe(gapPosition - OBSTACLE_CONFIG.GAP_SIZE / 2);

      // Bottom pipe should go from gap end to bottom of canvas
      expect(obstacle.bottomPipe.x).toBe(x);
      expect(obstacle.bottomPipe.y).toBe(gapPosition + OBSTACLE_CONFIG.GAP_SIZE / 2);
      expect(obstacle.bottomPipe.width).toBe(OBSTACLE_CONFIG.WIDTH);
      expect(obstacle.bottomPipe.height).toBe(canvasHeight - (gapPosition + OBSTACLE_CONFIG.GAP_SIZE / 2));
    });

    it('should initialize with passed flag as false', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      expect(obstacle.isPassed()).toBe(false);
    });

    it('should store gap properties correctly', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      expect(obstacle.gapPosition).toBe(gapPosition);
      expect(obstacle.gapSize).toBe(OBSTACLE_CONFIG.GAP_SIZE);
    });
  });

  describe('update', () => {
    it('should move obstacle to the left based on deltaTime', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      const deltaTime = 100; // 100ms
      const expectedMovement = OBSTACLE_CONFIG.SPEED * deltaTime;

      obstacle.update(deltaTime);

      expect(obstacle.topPipe.x).toBe(x - expectedMovement);
      expect(obstacle.bottomPipe.x).toBe(x - expectedMovement);
    });

    it('should move obstacle consistently over multiple updates', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      const deltaTime = 16.67; // ~60fps
      const updates = 10;

      for (let i = 0; i < updates; i++) {
        obstacle.update(deltaTime);
      }

      const expectedMovement = OBSTACLE_CONFIG.SPEED * deltaTime * updates;
      expect(obstacle.topPipe.x).toBeCloseTo(x - expectedMovement, 1);
      expect(obstacle.bottomPipe.x).toBeCloseTo(x - expectedMovement, 1);
    });
  });

  describe('isOffScreen', () => {
    it('should return false when obstacle is on screen', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      expect(obstacle.isOffScreen()).toBe(false);
    });

    it('should return true when obstacle is completely off-screen', () => {
      // Obstacle is off-screen when x + width < REMOVE_X
      // So we need x < REMOVE_X - width
      const obstacle = new Obstacle(OBSTACLE_CONFIG.REMOVE_X - OBSTACLE_CONFIG.WIDTH - 10, gapPosition, canvasHeight);
      expect(obstacle.isOffScreen()).toBe(true);
    });

    it('should return false when obstacle is partially off-screen', () => {
      const obstacle = new Obstacle(OBSTACLE_CONFIG.REMOVE_X + 10, gapPosition, canvasHeight);
      expect(obstacle.isOffScreen()).toBe(false);
    });
  });

  describe('passed tracking', () => {
    it('should mark obstacle as passed', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      
      obstacle.markAsPassed();
      
      expect(obstacle.isPassed()).toBe(true);
    });

    it('should not reset passed flag on update', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      
      obstacle.markAsPassed();
      obstacle.update(100);
      
      expect(obstacle.isPassed()).toBe(true);
    });
  });

  describe('getX', () => {
    it('should return current X position', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      expect(obstacle.getX()).toBe(x);
    });

    it('should return updated X position after movement', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      const deltaTime = 100;
      const expectedMovement = OBSTACLE_CONFIG.SPEED * deltaTime;

      obstacle.update(deltaTime);

      expect(obstacle.getX()).toBe(x - expectedMovement);
    });
  });

  describe('render', () => {
    it('should call canvas rendering methods', () => {
      const obstacle = new Obstacle(x, gapPosition, canvasHeight);
      const mockCtx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
      } as unknown as CanvasRenderingContext2D;

      obstacle.render(mockCtx);

      // Should render both pipes
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });
  });
});
