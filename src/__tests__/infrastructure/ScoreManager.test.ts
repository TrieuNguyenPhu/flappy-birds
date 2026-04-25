/**
 * ScoreManager unit tests
 * 
 * Tests Requirements: 5.1, 5.2, 5.3, 5.5
 */

import { ScoreManager } from '@/infrastructure/managers/ScoreManager';

describe('ScoreManager', () => {
  let scoreManager: ScoreManager;

  beforeEach(() => {
    scoreManager = new ScoreManager();
  });

  describe('Score initialization', () => {
    it('should initialize with zero score', () => {
      expect(scoreManager.getCurrentScore()).toBe(0);
    });

    it('should initialize with zero high score', () => {
      expect(scoreManager.getHighScore()).toBe(0);
    });

    it('should initialize with zero session high score', () => {
      expect(scoreManager.getSessionHighScore()).toBe(0);
    });
  });

  describe('Score increment', () => {
    it('should increment score by one', () => {
      scoreManager.incrementScore();
      expect(scoreManager.getCurrentScore()).toBe(1);
    });

    it('should increment score multiple times', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      expect(scoreManager.getCurrentScore()).toBe(3);
    });

    it('should update high score when current score exceeds it', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      expect(scoreManager.getHighScore()).toBe(2);
    });

    it('should update session high score when current score exceeds it', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      expect(scoreManager.getSessionHighScore()).toBe(3);
    });
  });

  describe('Score reset', () => {
    it('should reset current score to zero', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.reset();
      expect(scoreManager.getCurrentScore()).toBe(0);
    });

    it('should maintain high score after reset', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      const highScore = scoreManager.getHighScore();
      
      scoreManager.reset();
      
      expect(scoreManager.getHighScore()).toBe(highScore);
      expect(scoreManager.getHighScore()).toBe(3);
    });

    it('should maintain session high score after reset', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      const sessionHigh = scoreManager.getSessionHighScore();
      
      scoreManager.reset();
      
      expect(scoreManager.getSessionHighScore()).toBe(sessionHigh);
      expect(scoreManager.getSessionHighScore()).toBe(2);
    });
  });

  describe('High score tracking', () => {
    it('should track highest score across multiple games', () => {
      // First game
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.reset();

      // Second game with lower score
      scoreManager.incrementScore();
      scoreManager.reset();

      // Third game with higher score
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();

      expect(scoreManager.getHighScore()).toBe(5);
      expect(scoreManager.getSessionHighScore()).toBe(5);
    });

    it('should not decrease high score', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      
      const highScore = scoreManager.getHighScore();
      scoreManager.reset();
      
      scoreManager.incrementScore();
      
      expect(scoreManager.getHighScore()).toBe(highScore);
      expect(scoreManager.getHighScore()).toBe(3);
    });
  });

  describe('Reset all', () => {
    it('should reset all scores including high score', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      
      scoreManager.resetAll();
      
      expect(scoreManager.getCurrentScore()).toBe(0);
      expect(scoreManager.getHighScore()).toBe(0);
      expect(scoreManager.getSessionHighScore()).toBe(0);
    });
  });

  describe('Rendering', () => {
    let mockCtx: any;

    beforeEach(() => {
      mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillText: jest.fn(),
        strokeText: jest.fn(),
        font: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        textAlign: '',
        textBaseline: '',
      };
    });

    it('should render current score', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      
      scoreManager.render(mockCtx, 800);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('2', 780, 20);
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render game over screen with scores', () => {
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      scoreManager.incrementScore();
      
      scoreManager.renderGameOverScore(mockCtx, 800, 600);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalledWith('GAME OVER', 400, 220);
      expect(mockCtx.fillText).toHaveBeenCalledWith('Score: 3', 400, 300);
      expect(mockCtx.fillText).toHaveBeenCalledWith('Best: 3', 400, 350);
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });
});
