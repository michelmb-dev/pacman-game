import {
  DIRECTION_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  MAP,
  gameContext,
  blockSize,
  canvas,
} from "./utils"
import type { Ghost } from "./ghosts"

const pacmanFrames: HTMLImageElement = document.querySelector("#animation")!
const eatSound = new Audio("sounds/eat_ball.mp3")
const eatFruitSound = new Audio("sounds/eat_fruit.mp3")
let score = 0

/**
 *  Create Pacman player
 */
export class Pacman {
  direction: number
  nextDirection: number
  frameCount: number
  currentFrame: number

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public speed: number
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = speed
    this.direction = 4
    this.nextDirection = 4
    this.frameCount = 7
    this.currentFrame = 1
    setInterval(() => {
      this.changeAnimation()
    }, 100)
  }

  /**
   * If the direction can be changed, change it, then move forwards, then if there's a collision, move
   * backwards.
   */
  moveProcess(): void {
    this.changeDirectionIfPossible()
    this.moveForwards()
    if (this.checkCollisions()) {
      this.moveBackwards()
    }
  }

  /**
   * If the direction is right, then move left. If the direction is up, then move down. If the
   * direction is left, then move right. If the direction is down, then move up
   */
  moveBackwards(): void {
    switch (this.direction) {
      case DIRECTION_RIGHT: // Right
        this.x -= this.speed
        break
      case DIRECTION_UP: // Up
        this.y += this.speed
        break
      case DIRECTION_LEFT: // Left
        this.x += this.speed
        break
      case DIRECTION_BOTTOM: // Bottom
        this.y -= this.speed
        break
    }
  }

  /**
   * If the direction is right, increase the x position by the speed, if the direction is up, decrease
   * the y position by the speed, if the direction is left, decrease the x position by the speed, if
   * the direction is down, increase the y position by the speed.
   */
  moveForwards(): void {
    switch (this.direction) {
      case DIRECTION_RIGHT: // Right
        this.x += this.speed
        if (this.x >= canvas.width) {
          this.x = 0
        }
        break
      case DIRECTION_UP: // Up
        this.y -= this.speed
        if (this.y < 0) {
          this.y = canvas.height - this.height
        }
        break
      case DIRECTION_LEFT: // Left
        this.x -= this.speed
        if (this.x < 0) {
          this.x = canvas.width - this.width
        }
        break
      case DIRECTION_BOTTOM: // Bottom
        this.y += this.speed
        if (this.y >= canvas.height) {
          this.y = 0
        }
        break
    }
  }

  /**
   * If the player is on the same tile as a food item, then the food item is eaten and the score is
   * increased
   */
  eat(): void {
    for (let i = 0; i < MAP.length; i++) {
      for (let j = 0; j < MAP[0].length; j++) {
        if (MAP[i][j] === 2 && this.getMapX() === j && this.getMapY() === i) {
          MAP[i][j] = 3
          score += 10
          eatSound.volume = 0.2
          eatSound.play()
        }
        if (MAP[i][j] === 4 && this.getMapX() === j && this.getMapY() === i) {
          MAP[i][j] = 3
          score += 200
          eatFruitSound.play()
        }
      }
    }
  }

  /**
   * If any of the four corners of the player are inside a block, then the player is colliding with a
   * block
   * @returns A boolean value.
   */
  checkCollisions(): boolean {
    let isCollided = false
    if (
      MAP[Math.floor(this.y / blockSize)][Math.floor(this.x / blockSize)] ===
        1 ||
      MAP[Math.floor(this.y / blockSize + 0.9999)][
        Math.floor(this.x / blockSize)
      ] === 1 ||
      MAP[Math.floor(this.y / blockSize)][
        Math.floor(this.x / blockSize + 0.9999)
      ] === 1 ||
      MAP[Math.floor(this.y / blockSize + 0.9999)][
        Math.floor(this.x / blockSize + 0.9999)
      ] === 1
    ) {
      isCollided = true
    }
    return isCollided
  }

  /**
   * If the player's map coordinates are the same as any of the ghosts' map coordinates, return true
   * @param {Ghost[]} ghosts - Ghost[] - this is an array of Ghost objects.
   * @returns A boolean value.
   */
  checkGhostCollision(ghosts: Ghost[]): boolean {
    for (let i = 0; i < ghosts.length; i++) {
      if (
        ghosts[i].getMapX() == this.getMapX() &&
        ghosts[i].getMapY() == this.getMapY()
      ) {
        return true
      }
    }
    return false
  }

  /**
   * If the snake is not already moving in the direction it wants to move in, it tries to move in that
   * direction, and if it doesn't collide with anything, it keeps moving in that direction
   * @returns The return value is the value of the last expression evaluated.
   */
  changeDirectionIfPossible(): void {
    if (this.direction == this.nextDirection) return
    let tempDirection = this.direction
    this.direction = this.nextDirection
    this.moveForwards()
    if (this.checkCollisions()) {
      this.moveBackwards()
      this.direction = tempDirection
    } else {
      this.moveBackwards()
    }
  }

  /**
   * It returns the mapX value of the player
   * @returns The x coordinate of the player on the map.
   */
  getMapX(): number {
    let mapX = Math.floor(this.x / blockSize)
    return mapX
  }

  /**
   * This function returns the y-coordinate of the block that the player is currently standing on
   * @returns The y coordinate of the player on the map.
   */
  getMapY(): number {
    let mapY = Math.floor(this.y / blockSize)
    return mapY
  }

  /**
   * It returns the x coordinate of the right side of the player.
   * @returns The right side of the player's x position.
   */
  getMapXRightSide(): number {
    let mapX = Math.floor((this.x * 0.99 + blockSize) / blockSize)
    return mapX
  }

  /**
   * It returns the y coordinate of the right side of the player
   * @returns The y coordinate of the right side of the player.
   */
  getMapYRightSide(): number {
    let mapY = Math.floor((this.y * 0.99 + blockSize) / blockSize)
    return mapY
  }

  /**
   * If the current frame is equal to the total number of frames, set the current frame to 1,
   * otherwise, add 1 to the current frame
   */
  changeAnimation(): void {
    this.currentFrame =
      this.currentFrame === this.frameCount ? 1 : this.currentFrame + 1
  }

  /**
   * We save the current state of the canvas, translate the canvas to the center of the Pacman, rotate
   * the canvas to the direction of the Pacman, translate the canvas back to the original position,
   * draw the Pacman, and restore the canvas to its original state
   */
  draw(): void {
    gameContext.save()
    gameContext.translate(this.x + blockSize / 2, this.y + blockSize / 2)
    gameContext.rotate((this.direction * 90 * Math.PI) / 180)
    gameContext.translate(-this.x - blockSize / 2, -this.y - blockSize / 2)
    gameContext.drawImage(
      pacmanFrames,
      (this.currentFrame - 1) * blockSize,
      0,
      blockSize,
      blockSize,
      this.x,
      this.y,
      this.width,
      this.height
    )
    gameContext.restore()
  }
}

/**
 * It draws the remaining lives of the player
 * @param {number} lives - number - the number of lives the player has left
 */
export const drawRemainingLives = (lives: number): void => {
  const displayLives = document.querySelector("#lives")!
  for (let i = 0; i <= lives; i++) {
    displayLives!.innerHTML = lives.toString()
  }
}

/**
 * It draws the score on the canvas
 */
export const drawScore = (): void => {
  const displayScore = document.querySelector("#score")!
  displayScore.innerHTML = score.toString()
}
