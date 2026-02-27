/**
 * InputHandler unit tests
 * 
 * Tests Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { InputHandler, INPUT_CONFIG } from '@/infrastructure/engine/InputHandler';
import { GameEngine } from '@/infrastructure/engine/GameEngine';
import { GameState } from '@/shared/types';

// Mock GameEngine
jest.mock('@/infrastructure/engine/GameEngine');

describe('InputHandler', () => {
  let inputHandler: InputHandler;
  let mockGameEngine: jest.Mocked<GameEngine>;
  let mockBird: any;

  beforeEach(() => {
    // Create mock game engine
    mockGameEngine = new GameEngine() as jest.Mocked<GameEngine>;
    mockBird = {
      flap: jest.fn(),
    };

    // Setup mock methods
    mockGameEngine.getState = jest.fn().mockReturnValue(GameState.READY);
    mockGameEngine.getBird = jest.fn().mockReturnValue(mockBird);
    mockGameEngine.start = jest.fn();
    mockGameEngine.pause = jest.fn();
    mockGameEngine.resume = jest.fn();
    mockGameEngine.restart = jest.fn();

    inputHandler = new InputHandler(mockGameEngine);
  });

  afterEach(() => {
    inputHandler.destroy();
    jest.clearAllMocks();
  });

  describe('enableInput and disableInput', () => {
    it('should enable input handling', () => {
      inputHandler.enableInput();
      expect(inputHandler.isInputEnabled()).toBe(true);
    });

    it('should disable input handling', () => {
      inputHandler.enableInput();
      inputHandler.disableInput();
      expect(inputHandler.isInputEnabled()).toBe(false);
    });

    it('should not enable input twice', () => {
      inputHandler.enableInput();
      inputHandler.enableInput();
      expect(inputHandler.isInputEnabled()).toBe(true);
    });

    it('should not disable input twice', () => {
      inputHandler.enableInput();
      inputHandler.disableInput();
      inputHandler.disableInput();
      expect(inputHandler.isInputEnabled()).toBe(false);
    });
  });

  describe('Mouse click handling', () => {
    it('should trigger flap on mouse click during READY state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.READY);
      inputHandler.enableInput();

      const clickEvent = new MouseEvent('click');
      document.dispatchEvent(clickEvent);

      expect(mockGameEngine.start).toHaveBeenCalled();
      expect(mockBird.flap).toHaveBeenCalled();
    });

    it('should trigger flap on mouse click during PLAYING state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      const clickEvent = new MouseEvent('click');
      document.dispatchEvent(clickEvent);

      expect(mockBird.flap).toHaveBeenCalled();
    });

    it('should restart game on mouse click during GAME_OVER state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.GAME_OVER);
      inputHandler.enableInput();

      const clickEvent = new MouseEvent('click');
      document.dispatchEvent(clickEvent);

      expect(mockGameEngine.restart).toHaveBeenCalled();
    });

    it('should not process input when disabled', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();
      inputHandler.disableInput();

      const clickEvent = new MouseEvent('click');
      document.dispatchEvent(clickEvent);

      expect(mockBird.flap).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard handling', () => {
    it('should trigger flap on spacebar press during PLAYING state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      const keyEvent = new KeyboardEvent('keydown', { code: 'Space' });
      document.dispatchEvent(keyEvent);

      expect(mockBird.flap).toHaveBeenCalled();
    });

    it('should trigger flap on space key press during PLAYING state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      const keyEvent = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(keyEvent);

      expect(mockBird.flap).toHaveBeenCalled();
    });

    it('should not trigger flap on other key presses', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      const keyEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
      document.dispatchEvent(keyEvent);

      expect(mockBird.flap).not.toHaveBeenCalled();
    });
  });

  describe('Touch handling', () => {
    it('should trigger flap on touch start during PLAYING state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      document.dispatchEvent(touchEvent);

      expect(mockBird.flap).toHaveBeenCalled();
    });

    it('should start game on touch during READY state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.READY);
      inputHandler.enableInput();

      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      document.dispatchEvent(touchEvent);

      expect(mockGameEngine.start).toHaveBeenCalled();
      expect(mockBird.flap).toHaveBeenCalled();
    });
  });

  describe('Flap cooldown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should prevent rapid flap actions within cooldown period', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      // First flap
      const clickEvent1 = new MouseEvent('click');
      document.dispatchEvent(clickEvent1);
      expect(mockBird.flap).toHaveBeenCalledTimes(1);

      // Second flap immediately (should be blocked)
      const clickEvent2 = new MouseEvent('click');
      document.dispatchEvent(clickEvent2);
      expect(mockBird.flap).toHaveBeenCalledTimes(1); // Still 1

      // Advance time past cooldown
      jest.advanceTimersByTime(INPUT_CONFIG.FLAP_COOLDOWN + 10);

      // Third flap (should work)
      const clickEvent3 = new MouseEvent('click');
      document.dispatchEvent(clickEvent3);
      expect(mockBird.flap).toHaveBeenCalledTimes(2);
    });

    it('should allow flap after cooldown period expires', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      // First flap
      document.dispatchEvent(new MouseEvent('click'));
      expect(mockBird.flap).toHaveBeenCalledTimes(1);

      // Advance time past cooldown
      jest.advanceTimersByTime(INPUT_CONFIG.FLAP_COOLDOWN + 1);

      // Second flap (should work)
      document.dispatchEvent(new MouseEvent('click'));
      expect(mockBird.flap).toHaveBeenCalledTimes(2);
    });
  });

  describe('Game state transitions', () => {
    it('should start game from READY state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.READY);
      inputHandler.enableInput();

      document.dispatchEvent(new MouseEvent('click'));

      expect(mockGameEngine.start).toHaveBeenCalled();
    });

    it('should resume game from PAUSED state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PAUSED);
      inputHandler.enableInput();

      document.dispatchEvent(new MouseEvent('click'));

      expect(mockGameEngine.resume).toHaveBeenCalled();
    });

    it('should restart game from GAME_OVER state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.GAME_OVER);
      inputHandler.enableInput();

      document.dispatchEvent(new MouseEvent('click'));

      expect(mockGameEngine.restart).toHaveBeenCalled();
    });
  });

  describe('Visibility change handling', () => {
    it('should pause game when tab becomes hidden', () => {
      mockGameEngine.getState.mockReturnValue(GameState.PLAYING);
      inputHandler.enableInput();

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockGameEngine.pause).toHaveBeenCalled();
    });

    it('should not pause game when already in GAME_OVER state', () => {
      mockGameEngine.getState.mockReturnValue(GameState.GAME_OVER);
      inputHandler.enableInput();

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockGameEngine.pause).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove all event listeners on destroy', () => {
      inputHandler.enableInput();
      inputHandler.destroy();

      expect(inputHandler.isInputEnabled()).toBe(false);
    });
  });
});
