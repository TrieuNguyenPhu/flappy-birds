/**
 * Unit tests for GameEngine class
 */

import { GameEngine } from '@/infrastructure/engine/GameEngine';
import { GameState } from '@/shared/types';

describe('GameEngine', () => {
  let engine: GameEngine;
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    engine = new GameEngine();
    
    // Create mock canvas and context
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    mockCtx = mockCanvas.getContext('2d')!;
    
    engine.initialize(mockCanvas, mockCtx);
  });

  afterEach(() => {
    engine.destroy();
  });

  describe('State Management', () => {
    test('initializes in READY state', () => {
      expect(engine.getState()).toBe(GameState.READY);
    });

    test('transitions from READY to PLAYING on start', () => {
      engine.start();
      expect(engine.getState()).toBe(GameState.PLAYING);
    });

    test('does not start if already playing', () => {
      engine.start();
      const firstState = engine.getState();
      engine.start(); // Try to start again
      expect(engine.getState()).toBe(firstState);
    });

    test('transitions from PLAYING to PAUSED on pause', () => {
      engine.start();
      engine.pause();
      expect(engine.getState()).toBe(GameState.PAUSED);
    });

    test('does not pause if not playing', () => {
      engine.pause();
      expect(engine.getState()).toBe(GameState.READY);
    });

    test('transitions from PAUSED to PLAYING on resume', () => {
      engine.start();
      engine.pause();
      engine.resume();
      expect(engine.getState()).toBe(GameState.PLAYING);
    });

    test('transitions from PLAYING to GAME_OVER on gameOver', () => {
      engine.start();
      engine.gameOver();
      expect(engine.getState()).toBe(GameState.GAME_OVER);
    });

    test('does not trigger game over if not playing', () => {
      engine.gameOver();
      expect(engine.getState()).toBe(GameState.READY);
    });

    test('resets to READY state on restart', () => {
      engine.start();
      engine.gameOver();
      engine.restart();
      expect(engine.getState()).toBe(GameState.READY);
    });
  });

  describe('State Transition Validation', () => {
    test('validates READY -> PLAYING transition', () => {
      expect(engine.getState()).toBe(GameState.READY);
      engine.start();
      expect(engine.getState()).toBe(GameState.PLAYING);
    });

    test('validates PLAYING -> PAUSED transition', () => {
      engine.start();
      expect(engine.getState()).toBe(GameState.PLAYING);
      engine.pause();
      expect(engine.getState()).toBe(GameState.PAUSED);
    });

    test('validates PAUSED -> PLAYING transition', () => {
      engine.start();
      engine.pause();
      expect(engine.getState()).toBe(GameState.PAUSED);
      engine.resume();
      expect(engine.getState()).toBe(GameState.PLAYING);
    });

    test('validates PLAYING -> GAME_OVER transition', () => {
      engine.start();
      expect(engine.getState()).toBe(GameState.PLAYING);
      engine.gameOver();
      expect(engine.getState()).toBe(GameState.GAME_OVER);
    });

    test('validates GAME_OVER -> READY transition on restart', () => {
      engine.start();
      engine.gameOver();
      expect(engine.getState()).toBe(GameState.GAME_OVER);
      engine.restart();
      expect(engine.getState()).toBe(GameState.READY);
    });
  });

  describe('Game Loop', () => {
    test('starts game loop when transitioning to PLAYING', (done) => {
      engine.start();
      
      // Give the game loop time to execute at least one frame
      setTimeout(() => {
        expect(engine.getState()).toBe(GameState.PLAYING);
        done();
      }, 50);
    });

    test('stops game loop when paused', (done) => {
      engine.start();
      
      setTimeout(() => {
        engine.pause();
        expect(engine.getState()).toBe(GameState.PAUSED);
        done();
      }, 50);
    });

    test('stops game loop on game over', (done) => {
      engine.start();
      
      setTimeout(() => {
        engine.gameOver();
        expect(engine.getState()).toBe(GameState.GAME_OVER);
        done();
      }, 50);
    });

    test('stops game loop on restart', (done) => {
      engine.start();
      
      setTimeout(() => {
        engine.restart();
        expect(engine.getState()).toBe(GameState.READY);
        done();
      }, 50);
    });
  });

  describe('Initialization', () => {
    test('initializes with canvas and context', () => {
      const newEngine = new GameEngine();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      newEngine.initialize(canvas, ctx);
      expect(newEngine.getState()).toBe(GameState.READY);
      
      newEngine.destroy();
    });
  });

  describe('Cleanup', () => {
    test('cleans up resources on destroy', () => {
      engine.start();
      engine.destroy();
      
      // After destroy, state should remain but game loop should stop
      // We can't directly test if requestAnimationFrame was cancelled,
      // but we can verify the engine doesn't crash
      expect(() => engine.destroy()).not.toThrow();
    });
  });
});
