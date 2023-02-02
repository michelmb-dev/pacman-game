import {
  DIRECTION_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  MAP,
  gameContext,
  blockSize,
} from "./utils"
import type { Ghost } from "./ghosts"

const pacmanFrames: HTMLImageElement = document.querySelector("#animation")!

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

  moveProcess() {
    this.changeDirectionIfPossible()
    this.moveForwards()
    if (this.checkCollisions()) {
      this.moveBackwards()
      return
    }
  }

  moveBackwards() {
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

  moveForwards() {
    switch (this.direction) {
      case DIRECTION_RIGHT: // Right
        this.x += this.speed
        break
      case DIRECTION_UP: // Up
        this.y -= this.speed
        break
      case DIRECTION_LEFT: // Left
        this.x -= this.speed
        break
      case DIRECTION_BOTTOM: // Bottom
        this.y += this.speed
        break
    }
  }

  eat(score: number): number {
    for (let i = 0; i < MAP.length; i++) {
      for (let j = 0; j < MAP[0].length; j++) {
        if (MAP[i][j] === 2 && this.getMapX() === j && this.getMapY() === i) {
          MAP[i][j] = 3
          score++
        }
      }
    }
    return score
  }

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

  getMapX(): number {
    let mapX = Math.floor(this.x / blockSize)
    return mapX
  }

  getMapY(): number {
    let MAPY = Math.floor(this.y / blockSize)
    return MAPY
  }

  getMapXRightSide(): number {
    let MAPX = Math.floor((this.x * 0.99 + blockSize) / blockSize)
    return MAPX
  }

  getMapYRightSide(): number {
    let MapY = Math.floor((this.y * 0.99 + blockSize) / blockSize)
    return MapY
  }

  changeAnimation() {
    this.currentFrame =
      this.currentFrame === this.frameCount ? 1 : this.currentFrame + 1
  }

  draw() {
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

export const drawRemainingLives = (lives: number) => {
  gameContext.font = "20px Emulogic"
  gameContext.fillStyle = "white"
  gameContext.fillText("Lives: ", 220, blockSize * (MAP.length + 1))

  for (let i = 0; i < lives; i++) {
    gameContext.drawImage(
      pacmanFrames,
      2 * blockSize,
      0,
      blockSize,
      blockSize,
      350 + i * blockSize,
      blockSize * MAP.length + 2,
      blockSize,
      blockSize
    )
  }
}
