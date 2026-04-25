/**
 * CollisionDetector - Handles collision detection between game entities
 * 
 * Validates Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { Rectangle } from '@/shared/types';
import { Bird } from '@/core/entities/Bird';
import { Obstacle } from '@/core/entities/Obstacle';

/**
 * CollisionDetector class provides precise collision detection methods
 */
export class CollisionDetector {
  /**
   * Check if the bird collides with a pipe obstacle
   * Validates Requirement 4.1: Detect bird intersection with pipe segments
   * Validates Requirement 4.4: Use precise bounding box calculations
   * 
   * @param bird - The bird entity
   * @param obstacle - The obstacle to check collision with
   * @returns True if collision detected
   */
  public checkBirdPipeCollision(bird: Bird, obstacle: Obstacle): boolean {
    const birdBounds = bird.getBounds();

    // Check collision with top pipe
    if (this.rectanglesIntersect(birdBounds, obstacle.topPipe)) {
      return true;
    }

    // Check collision with bottom pipe
    if (this.rectanglesIntersect(birdBounds, obstacle.bottomPipe)) {
      return true;
    }

    return false;
  }

  /**
   * Check if the bird collides with screen boundaries
   * Validates Requirement 4.2: Detect bird touching ground boundary
   * Validates Requirement 4.3: Detect bird touching ceiling boundary
   * Validates Requirement 4.4: Use precise bounding box calculations
   * 
   * @param bird - The bird entity
   * @param bounds - The screen boundaries (canvas dimensions)
   * @returns True if collision detected
   */
  public checkBirdBoundaryCollision(bird: Bird, bounds: Rectangle): boolean {
    const birdBounds = bird.getBounds();

    // Check if bird hits the ground (bottom boundary)
    if (birdBounds.y + birdBounds.height >= bounds.height) {
      return true;
    }

    // Check if bird hits the ceiling (top boundary)
    if (birdBounds.y <= bounds.y) {
      return true;
    }

    return false;
  }

  /**
   * Check if the bird has passed an obstacle (for scoring)
   * Validates Requirement 5.2: Increment score when bird passes through pipe gap
   * 
   * @param bird - The bird entity
   * @param obstacle - The obstacle to check
   * @returns True if bird has passed the obstacle
   */
  public checkBirdPassedObstacle(bird: Bird, obstacle: Obstacle): boolean {
    const birdBounds = bird.getBounds();
    const obstacleRightEdge = obstacle.getX() + obstacle.topPipe.width;

    // Bird has passed if its left edge is past the obstacle's right edge
    return birdBounds.x > obstacleRightEdge;
  }

  /**
   * Check if two rectangles intersect using AABB (Axis-Aligned Bounding Box) collision
   * Validates Requirement 4.4: Precise bounding box calculations for accuracy
   * 
   * @param rect1 - First rectangle
   * @param rect2 - Second rectangle
   * @returns True if rectangles intersect
   */
  private rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}
