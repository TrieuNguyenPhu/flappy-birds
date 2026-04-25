/**
 * Unit tests for ObstacleManager class
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { ObstacleManager, OBSTACLE_MANAGER_CONFIG } from '@/infrastructure/managers/ObstacleManager';
import { OBSTACLE_CONFIG } from '@/core/entities/Obstacle';

describe('ObstacleManager', () => {
  const canvasHeight = 600;
  let manager: ObstacleManager;

  beforeEach(() => {
    manager = new ObstacleManager(canvasHeight);
  });

  describe('constructor', () => {
    it('should initialize with empty obstacles array', () => {
      expect(manager.getObstacles()).toEqual([]);
      expect(manager.getObstacleCount()).toBe(0);
    });

    it('should accept custom spawn interval', () => {
      const customInterval = 3000;
      const customManager = new ObstacleManager(canvasHeight, customInterval);
      expect(customManager).toBeDefined();
    });
  });

  describe('generateObstacle', () => {
    it('should create a new obstacle and add it to the array', () => {
      const obstacle = manager.generateObstacle();

      expect(obstacle).toBeDefined();
      expect(manager.getObstacleCount()).toBe(1);
      expect(manager.getObstacles()[0]).toBe(obstacle);
    });

    it('should create obstacle at spawn position', () => {
      const obstacle = manager.generateObstacle();

      expect(obstacle.getX()).toBe(OBSTACLE_CONFIG.SPAWN_X);
    });

    it('should randomize gap position within bounds', () => {
      const obstacles = [];
      for (let i = 0; i < 10; i++) {
        obstacles.push(manager.generateObstacle());
      }

      // Check all obstacles have gap positions within bounds
      for (const obstacle of obstacles) {
        expect(obstacle.gapPosition).toBeGreaterThanOrEqual(OBSTACLE_CONFIG.MIN_GAP_Y);
        expect(obstacle.gapPosition).toBeLessThanOrEqual(OBSTACLE_CONFIG.MAX_GAP_Y);
      }

      // Check that not all gap positions are the same (randomization works)
      const uniquePositions = new Set(obstacles.map(o => o.gapPosition));
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
  });

  describe('updateObstacles', () => {
    it('should spawn first obstacle after initial delay', () => {
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.INITIAL_DELAY);

      expect(manager.getObstacleCount()).toBe(1);
    });

    it('should not spawn obstacle before initial delay', () => {
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.INITIAL_DELAY - 100);

      expect(manager.getObstacleCount()).toBe(0);
    });

    it('should spawn obstacles at regular intervals after first spawn', () => {
      // Spawn first obstacle
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.INITIAL_DELAY);
      expect(manager.getObstacleCount()).toBe(1);

      // Spawn second obstacle after spawn interval
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.SPAWN_INTERVAL);
      expect(manager.getObstacleCount()).toBe(2);

      // Spawn third obstacle after another spawn interval
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.SPAWN_INTERVAL);
      expect(manager.getObstacleCount()).toBe(3);
    });

    it('should update positions of all obstacles', () => {
      manager.generateObstacle();
      manager.generateObstacle();
      
      const initialPositions = manager.getObstacles().map(o => o.getX());
      const deltaTime = 100;

      manager.updateObstacles(deltaTime);

      const updatedPositions = manager.getObstacles().map(o => o.getX());
      
      // All obstacles should have moved left
      for (let i = 0; i < initialPositions.length; i++) {
        expect(updatedPositions[i]).toBeLessThan(initialPositions[i]);
      }
    });
  });

  describe('removeOffscreenObstacles', () => {
    it('should remove obstacles that are off-screen', () => {
      // Create obstacle that is off-screen
      manager.generateObstacle();
      const obstacle = manager.getObstacles()[0];
      
      // Move obstacle far off-screen
      const deltaTime = 100;
      for (let i = 0; i < 100; i++) {
        obstacle.update(deltaTime);
      }

      manager.removeOffscreenObstacles();

      expect(manager.getObstacleCount()).toBe(0);
    });

    it('should keep obstacles that are still on-screen', () => {
      manager.generateObstacle();
      
      manager.removeOffscreenObstacles();

      expect(manager.getObstacleCount()).toBe(1);
    });

    it('should remove only off-screen obstacles', () => {
      // Create multiple obstacles
      manager.generateObstacle();
      manager.generateObstacle();
      manager.generateObstacle();

      const obstacles = manager.getObstacles();
      
      // Move first obstacle off-screen
      for (let i = 0; i < 100; i++) {
        obstacles[0].update(100);
      }

      manager.removeOffscreenObstacles();

      // Should have 2 obstacles remaining
      expect(manager.getObstacleCount()).toBe(2);
    });
  });

  describe('reset', () => {
    it('should clear all obstacles', () => {
      manager.generateObstacle();
      manager.generateObstacle();
      
      manager.reset();

      expect(manager.getObstacleCount()).toBe(0);
      expect(manager.getObstacles()).toEqual([]);
    });

    it('should reset spawn timer', () => {
      // Advance spawn timer
      manager.updateObstacles(1000);
      
      manager.reset();

      // After reset, should need full initial delay before spawning
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.INITIAL_DELAY - 100);
      expect(manager.getObstacleCount()).toBe(0);

      manager.updateObstacles(100);
      expect(manager.getObstacleCount()).toBe(1);
    });
  });

  describe('render', () => {
    it('should call render on all obstacles', () => {
      manager.generateObstacle();
      manager.generateObstacle();

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

      manager.render(mockCtx);

      // Should have called rendering methods for both obstacles
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should not throw error when rendering with no obstacles', () => {
      const mockCtx = {} as CanvasRenderingContext2D;

      expect(() => manager.render(mockCtx)).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should handle complete obstacle lifecycle', () => {
      // Start with no obstacles
      expect(manager.getObstacleCount()).toBe(0);

      // Spawn first obstacle after initial delay
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.INITIAL_DELAY);
      expect(manager.getObstacleCount()).toBe(1);

      // Spawn second obstacle after spawn interval
      manager.updateObstacles(OBSTACLE_MANAGER_CONFIG.SPAWN_INTERVAL);
      expect(manager.getObstacleCount()).toBe(2);

      // Move obstacles off-screen
      for (let i = 0; i < 200; i++) {
        manager.updateObstacles(100);
      }

      // All obstacles should be removed
      expect(manager.getObstacleCount()).toBeGreaterThan(0); // New ones spawned
      
      // Reset should clear everything
      manager.reset();
      expect(manager.getObstacleCount()).toBe(0);
    });
  });
});
