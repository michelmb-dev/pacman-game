import {
  blockSize,
  canvas,
  DIRECTION,
  gameContext,
  MAP,
  randomTargetsForGhosts,
} from "../utils"
import type { Pacman } from "./Pacman"

const ghostFrames: HTMLImageElement = document.querySelector("#ghosts")!
const ghostFramesFrightened: HTMLImageElement =
  document.querySelector("#ghosts-frightened")!

type Queue = {
  x: number
  y: number
  rightX?: number
  rightY?: number
  moves: number[]
}

/**
 *  Create a Ghost for the game
 */
export class Ghost {
  direction: number
  randomTargetIndex: number
  target: { x: number; y: number }
  frameCount: number
  currentFrame: number
  frightened: boolean

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public speed: number,
    public imageX: number,
    public imageY: number,
    public imageWidth: number,
    public imageHeight: number,
    public range: number
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = speed
    this.direction = DIRECTION.RIGHT
    this.imageX = imageX
    this.imageY = imageY
    this.imageHeight = imageHeight
    this.imageWidth = imageWidth
    this.range = range
    this.randomTargetIndex = Math.floor(Math.random() * 4)
    this.target = randomTargetsForGhosts[this.randomTargetIndex]
    this.frameCount = 7
    this.currentFrame = 1
    this.changeRandomDirection()
    this.frightened = false
  }

  /**
   * If the distance between the ghost and Pacman is less than or equal to the ghost is range, then
   * return true
   * @param {Pacman} pacman - Pacman - the pacman object
   * @returns A boolean value.
   */
  isInRange(pacman: Pacman): boolean {
    let xDistance = Math.abs(pacman.getMapX() - this.getMapX())
    let yDistance = Math.abs(pacman.getMapY() - this.getMapY())
    return (
      Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range
    )
  }

  /**
   * It adds 1 to the randomTargetIndex, and then sets the randomTargetIndex to the remainder of the
   * randomTargetIndex divided by 4.
   */
  changeRandomDirection(): void {
    let addition = 1
    this.randomTargetIndex += addition
    this.randomTargetIndex = this.randomTargetIndex % 4
  }

  /**
   * If the ghost is in range of Pacman, it will move towards Pacman, otherwise it will move towards a
   * random target
   * @param {Pacman} pacman - Pacman - the pacman object.
   */
  moveProcess(pacman: Pacman): void {
    if (this.frightened) {
      this.target = {
        x:
          9 * blockSize + (this.randomTargetIndex % 2 == 0 ? 0 : 1) * blockSize,
        y:
          12 * blockSize +
          (this.randomTargetIndex % 2 == 0 ? 0 : 1) * blockSize,
      }
    } else {
      if (this.isInRange(pacman)) {
        this.target = pacman
      } else {
        this.target = randomTargetsForGhosts[this.randomTargetIndex]
      }
    }
    this.changeDirectionIfPossible()
    this.moveForwards()
    if (this.checkCollisions()) {
      this.moveBackwards()
    }
  }

  setFrightenedMode(duration: number): void {
    this.frightened = true
    setTimeout(() => {
      this.frightened = false
    }, duration)
  }

  /**
   * If the direction is 4, then move the x coordinate to the left by the speed. If the direction is 3,
   * then move the y coordinate up by the speed. If the direction is 2, then move the x coordinate to
   * the right by the speed. If the direction is 1, then move the y coordinate down by the speed.
   */
  moveBackwards(): void {
    switch (this.direction) {
      case 4: // Right
        this.x -= this.speed
        break
      case 3: // Up
        this.y += this.speed
        break
      case 2: // Left
        this.x += this.speed
        break
      case 1: // Bottom
        this.y -= this.speed
        break
    }
  }

  /**
   * If the direction is 4, then move right, if it is 3, then move up, if it is 2, then move left, and if
   * it is 1, then move down.
   */
  moveForwards(): void {
    switch (this.direction) {
      case 4: // Right
        this.x += this.speed
        if (this.x >= canvas.width) {
          this.x = 0
        }
        break
      case 3: // Up
        this.y -= this.speed
        if (this.y < 0) {
          this.y = canvas.height - this.height
        }
        break
      case 2: // Left
        this.x -= this.speed
        if (this.x < 0) {
          this.x = canvas.width - this.width
        }
        break
      case 1: // Bottom
        this.y += this.speed
        if (this.y >= canvas.height) {
          this.y = 0
        }
        break
    }
  }

  /**
   * If any of the four corners of the player are inside a block, then the player is colliding with a
   * block
   * @returns A boolean value.
   */
  checkCollisions(): boolean {
    return (
      MAP[Math.floor(this.y / blockSize)][Math.floor(this.x / blockSize)] ==
        1 ||
      MAP[Math.floor(this.y / blockSize + 0.9999)][
        Math.floor(this.x / blockSize)
      ] == 1 ||
      MAP[Math.floor(this.y / blockSize)][
        Math.floor(this.x / blockSize + 0.9999)
      ] == 1 ||
      MAP[Math.floor(this.y / blockSize + 0.9999)][
        Math.floor(this.x / blockSize + 0.9999)
      ] == 1
    )
  }

  /**
   * If the player is in the same block as the ghost, the ghost will try to move in a direction that
   * will take it closer to the player. If it can't move in that direction, it will move in the
   * direction it is already moving
   * @returns The direction of the ghost.
   */
  changeDirectionIfPossible(): void {
    let tempDirection = this.direction
    this.direction = this.calculateNewDirection(
      MAP,
      Math.floor(this.target.x / blockSize),
      Math.floor(this.target.y / blockSize)
    )
    if (typeof this.direction == "undefined") {
      this.direction = tempDirection
    }
    if (
      this.getMapY() != this.getMapYRightSide() &&
      (this.direction == DIRECTION.LEFT || this.direction == DIRECTION.RIGHT)
    ) {
      this.direction = DIRECTION.UP
    }
    if (
      this.getMapX() != this.getMapXRightSide() &&
      this.direction == DIRECTION.UP
    ) {
      this.direction = DIRECTION.LEFT
    }
    this.moveForwards()
    if (this.checkCollisions()) {
      this.moveBackwards()
      this.direction = tempDirection
    } else {
      this.moveBackwards()
    }
  }

  /**
   * It takes a map, a destination x and y, and returns the direction to move to get to the destination
   * @param {number[][]} map - number[][] - The map of the game.
   * @param {number} destX - The x coordinate of the destination
   * @param {number} destY - The y coordinate of the destination
   * @returns The direction the player should move in to get to the destination.
   */
  calculateNewDirection(map: number[][], destX: number, destY: number): number {
    let mp: typeof MAP = []
    for (let i = 0; i < map.length; i++) {
      mp[i] = map[i].slice()
    }

    let queue: [Queue] = [
      {
        x: this.getMapX(),
        y: this.getMapY(),
        rightX: this.getMapXRightSide(),
        rightY: this.getMapYRightSide(),
        moves: [],
      },
    ]
    while (queue.length > 0) {
      let popped = queue.shift()
      if (popped !== undefined)
        if (popped.x == destX && popped.y == destY) {
          return popped.moves[0]
        } else {
          mp[popped.y][popped.x] = 1
          let neighborList = this.addNeighbors(popped, mp)
          for (let i = 0; i < neighborList.length; i++) {
            queue.push(neighborList[i])
          }
        }
    }

    return 1 // direction
  }

  /**
   * It takes a node and returns all the nodes that are adjacent to it
   * @param {Queue} popped - The current node that we are looking at.
   * @param mp - the map
   * @returns the shortest path from the start to the end.
   */
  addNeighbors(popped: Queue, mp: typeof MAP) {
    let queue = []
    let numOfRows = mp.length
    let numOfColumns = mp[0].length

    if (
      popped.x - 1 >= 0 &&
      popped.x - 1 < numOfRows &&
      mp[popped.y][popped.x - 1] != 1
    ) {
      let tempMoves = popped.moves.slice()
      tempMoves.push(DIRECTION.LEFT)
      queue.push({ x: popped.x - 1, y: popped.y, moves: tempMoves })
    }
    if (
      popped.x + 1 >= 0 &&
      popped.x + 1 < numOfRows &&
      mp[popped.y][popped.x + 1] != 1
    ) {
      let tempMoves = popped.moves.slice()
      tempMoves.push(DIRECTION.RIGHT)
      queue.push({ x: popped.x + 1, y: popped.y, moves: tempMoves })
    }
    if (
      popped.y - 1 >= 0 &&
      popped.y - 1 < numOfColumns &&
      mp[popped.y - 1][popped.x] != 1
    ) {
      let tempMoves = popped.moves.slice()
      tempMoves.push(DIRECTION.UP)
      queue.push({ x: popped.x, y: popped.y - 1, moves: tempMoves })
    }
    if (
      popped.y + 1 >= 0 &&
      popped.y + 1 < numOfColumns &&
      mp[popped.y + 1][popped.x] != 1
    ) {
      let tempMoves = popped.moves.slice()
      tempMoves.push(DIRECTION.DOWN)
      queue.push({ x: popped.x, y: popped.y + 1, moves: tempMoves })
    }
    return queue
  }

  /**
   * It returns the mapX value of the player
   * @returns The x coordinate of the player on the map.
   */
  getMapX(): number {
    return Math.floor(this.x / blockSize)
  }

  /**
   * It returns the y coordinate of the block that the player is currently standing on
   * @returns The y coordinate of the player on the map.
   */
  getMapY(): number {
    return Math.floor(this.y / blockSize)
  }

  /**
   * It returns the mapX of the right side of the player
   * @returns The x coordinate of the right side of the player.
   */
  getMapXRightSide(): number {
    return Math.floor((this.x * 0.99 + blockSize) / blockSize)
  }

  /**
   * It returns the mapY coordinate of the right side of the player
   * @returns The y coordinate of the right side of the player.
   */
  getMapYRightSide(): number {
    return Math.floor((this.y * 0.99 + blockSize) / blockSize)
  }

  createArcForDebug(): void {
    gameContext.beginPath()
    gameContext.strokeStyle = "red"
    gameContext.arc(
      this.x + blockSize / 2,
      this.y + blockSize / 2,
      this.range * blockSize,
      0,
      2 * Math.PI
    )
    gameContext.stroke()
  }

  /**
   * The draw function draws the ghost image on the canvas
   */
  draw(): void {
    gameContext.save()
    gameContext.drawImage(
      this.frightened ? ghostFramesFrightened : ghostFrames,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width + 2,
      this.height + 2
    )
    //this.createArcForDebug()
    gameContext.restore()
  }
}
