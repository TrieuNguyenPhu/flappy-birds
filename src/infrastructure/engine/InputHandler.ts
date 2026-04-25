/**
 * InputHandler - Manages cross-platform user input (mouse, touch, keyboard)
 * 
 * Validates Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.3, 9.5
 */

import { GameEngine } from './GameEngine';
import { GameState } from '@/shared/types';

/**
 * InputHandler configuration constants
 */
export const INPUT_CONFIG = {
  FLAP_COOLDOWN: 150, // Minimum time between flaps in milliseconds
  TOUCH_RESPONSE_TARGET: 50, // Target touch response time in milliseconds
} as const;

/**
 * InputHandler class processes user interactions across different input methods
 */
export class InputHandler {
  private gameEngine: GameEngine;
  private isEnabled: boolean;
  private lastFlapTime: number;
  private readonly flapCooldown: number;
  private boundHandlers: Map<string, EventListener>;

  /**
   * Create a new InputHandler
   * 
   * @param gameEngine - The game engine instance to control
   * @param flapCooldown - Minimum time between flaps in milliseconds
   */
  constructor(
    gameEngine: GameEngine,
    flapCooldown: number = INPUT_CONFIG.FLAP_COOLDOWN
  ) {
    this.gameEngine = gameEngine;
    this.isEnabled = false;
    this.lastFlapTime = 0;
    this.flapCooldown = flapCooldown;
    this.boundHandlers = new Map();
  }

  /**
   * Enable input handling and attach event listeners
   * Validates Requirements: 3.1, 3.2, 3.3, 9.5
   */
  public enableInput(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;

    // Bind event handlers
    const mouseClickHandler = this.handleMouseClick.bind(this) as EventListener;
    const touchStartHandler = this.handleTouchStart.bind(this) as EventListener;
    const keyPressHandler = this.handleKeyPress.bind(this) as EventListener;
    const visibilityChangeHandler = this.handleVisibilityChange.bind(this) as EventListener;

    // Store bound handlers for cleanup
    this.boundHandlers.set('click', mouseClickHandler);
    this.boundHandlers.set('touchstart', touchStartHandler);
    this.boundHandlers.set('keydown', keyPressHandler);
    this.boundHandlers.set('visibilitychange', visibilityChangeHandler);

    // Attach event listeners
    // Validates Requirement 3.1: Mouse click triggers flap action
    document.addEventListener('click', mouseClickHandler);

    // Validates Requirement 3.2: Touch tap triggers flap action
    // Validates Requirement 9.3: Touch response within 50ms
    document.addEventListener('touchstart', touchStartHandler, { passive: false });

    // Validates Requirement 3.3: Spacebar triggers flap action
    document.addEventListener('keydown', keyPressHandler);

    // Validates Requirement 9.5: Pause game when browser tab loses focus
    document.addEventListener('visibilitychange', visibilityChangeHandler);

    // Prevent default touch behaviors to avoid scrolling
    document.addEventListener('touchmove', this.preventDefaultTouch, { passive: false });
  }

  /**
   * Disable input handling and remove event listeners
   * Validates Requirement 3.5: Only accept restart inputs during game over
   */
  public disableInput(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;

    // Remove all event listeners
    const mouseClickHandler = this.boundHandlers.get('click');
    const touchStartHandler = this.boundHandlers.get('touchstart');
    const keyPressHandler = this.boundHandlers.get('keydown');
    const visibilityChangeHandler = this.boundHandlers.get('visibilitychange');

    if (mouseClickHandler) {
      document.removeEventListener('click', mouseClickHandler as EventListener);
    }
    if (touchStartHandler) {
      document.removeEventListener('touchstart', touchStartHandler as EventListener);
    }
    if (keyPressHandler) {
      document.removeEventListener('keydown', keyPressHandler as EventListener);
    }
    if (visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', visibilityChangeHandler as EventListener);
    }

    document.removeEventListener('touchmove', this.preventDefaultTouch);

    this.boundHandlers.clear();
  }

  /**
   * Handle mouse click events
   * Validates Requirement 3.1: Mouse click triggers flap action
   * 
   * @param event - Mouse event
   */
  private handleMouseClick(event: MouseEvent): void {
    event.preventDefault();
    this.processInput();
  }

  /**
   * Handle touch start events
   * Validates Requirement 3.2: Touch tap triggers flap action
   * Validates Requirement 9.3: Touch response within 50ms
   * 
   * @param event - Touch event
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.processInput();
  }

  /**
   * Handle keyboard events
   * Validates Requirement 3.3: Spacebar triggers flap action
   * 
   * @param event - Keyboard event
   */
  private handleKeyPress(event: KeyboardEvent): void {
    // Only respond to spacebar
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.processInput();
    }
  }

  /**
   * Handle browser visibility changes
   * Validates Requirement 9.5: Pause game when browser tab loses focus
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Tab is hidden - pause the game if playing
      if (this.gameEngine.getState() === GameState.PLAYING) {
        this.gameEngine.pause();
      }
    }
  }

  /**
   * Prevent default touch move behavior to avoid scrolling
   * 
   * @param event - Touch event
   */
  private preventDefaultTouch(event: TouchEvent): void {
    event.preventDefault();
  }

  /**
   * Process input based on current game state
   * Validates Requirements: 3.4, 3.5
   */
  private processInput(): void {
    if (!this.isEnabled) return;

    const currentState = this.gameEngine.getState();

    // Handle input based on game state
    switch (currentState) {
      case GameState.READY:
        // Start the game on first input
        this.gameEngine.start();
        this.triggerFlap();
        break;

      case GameState.PLAYING:
        // Trigger flap during gameplay
        this.triggerFlap();
        break;

      case GameState.GAME_OVER:
        // Restart the game
        // Validates Requirement 3.5: Only accept restart inputs during game over
        this.gameEngine.restart();
        break;

      case GameState.PAUSED:
        // Resume the game
        this.gameEngine.resume();
        break;
    }
  }

  /**
   * Trigger a flap action with cooldown check
   * Validates Requirement 3.4: Prevent multiple rapid flap actions
   */
  private triggerFlap(): void {
    const currentTime = Date.now();
    const timeSinceLastFlap = currentTime - this.lastFlapTime;

    // Check cooldown
    // Validates Requirement 3.4: Minimum time threshold between flaps
    if (timeSinceLastFlap < this.flapCooldown) {
      return; // Still in cooldown period
    }

    // Get the bird and trigger flap
    const bird = this.gameEngine.getBird();
    if (bird) {
      bird.flap();
      this.lastFlapTime = currentTime;
    }
  }

  /**
   * Check if input is currently enabled
   */
  public isInputEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get the last flap time
   */
  public getLastFlapTime(): number {
    return this.lastFlapTime;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.disableInput();
  }
}
