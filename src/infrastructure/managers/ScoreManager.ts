/**
 * ScoreManager - Manages game scoring and high score tracking
 * 
 * Validates Requirements: 5.1, 5.2, 5.3, 5.5
 */

/**
 * ScoreManager class handles score tracking and display
 */
export class ScoreManager {
  private currentScore: number;
  private highScore: number;
  private sessionHighScore: number;

  constructor() {
    this.currentScore = 0;
    this.highScore = 0;
    this.sessionHighScore = 0;
  }

  /**
   * Get the current score
   * Validates Requirement 5.1: Display current score
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Get the high score for the current session
   * Validates Requirement 5.3: Maintain highest score during current session
   */
  public getHighScore(): number {
    return this.highScore;
  }

  /**
   * Get the session high score
   */
  public getSessionHighScore(): number {
    return this.sessionHighScore;
  }

  /**
   * Increment the score by one point
   * Validates Requirement 5.2: Increment score when bird passes through pipe gap
   */
  public incrementScore(): void {
    this.currentScore++;

    // Update session high score if current score exceeds it
    if (this.currentScore > this.sessionHighScore) {
      this.sessionHighScore = this.currentScore;
    }

    // Update high score if current score exceeds it
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
    }
  }

  /**
   * Reset the current score to zero
   * Validates Requirement 5.5: Reset score to zero when new game begins
   */
  public reset(): void {
    this.currentScore = 0;
  }

  /**
   * Reset all scores including high score
   */
  public resetAll(): void {
    this.currentScore = 0;
    this.highScore = 0;
    this.sessionHighScore = 0;
  }

  /**
   * Render the score display on the canvas
   * Validates Requirement 5.1: Display score in top right corner
   * 
   * @param ctx - Canvas rendering context
   * @param canvasWidth - Width of the canvas
   */
  public render(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
    ctx.save();

    // Set text properties
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // Draw score in top right corner
    const scoreText = this.currentScore.toString();
    const x = canvasWidth - 20;
    const y = 20;

    // Draw text outline
    ctx.strokeText(scoreText, x, y);
    // Draw text fill
    ctx.fillText(scoreText, x, y);

    ctx.restore();
  }

  /**
   * Render the final score on game over screen
   * Validates Requirement 5.4: Display final score on game over screen
   * 
   * @param ctx - Canvas rendering context
   * @param canvasWidth - Width of the canvas
   * @param canvasHeight - Height of the canvas
   */
  public renderGameOverScore(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    ctx.save();

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Draw "Game Over" text
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText('GAME OVER', centerX, centerY - 80);
    ctx.fillText('GAME OVER', centerX, centerY - 80);

    // Draw current score
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    const scoreText = `Score: ${this.currentScore}`;
    ctx.strokeText(scoreText, centerX, centerY);
    ctx.fillText(scoreText, centerX, centerY);

    // Draw high score
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    const highScoreText = `Best: ${this.sessionHighScore}`;
    ctx.strokeText(highScoreText, centerX, centerY + 50);
    ctx.fillText(highScoreText, centerX, centerY + 50);

    // Draw restart instruction
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.lineWidth = 2;

    const restartText = 'Click or Press Space to Restart';
    ctx.strokeText(restartText, centerX, centerY + 120);
    ctx.fillText(restartText, centerX, centerY + 120);

    ctx.restore();
  }
}
