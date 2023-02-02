import {
  DIRECTION_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  MAP,
  blockSize,
  gameContext,
  randomTargetsForGhosts,
} from "./utils"
import type { Pacman } from "./pacman"

const ghostFrames: HTMLImageElement = document.querySelector("#ghosts")!

type Queue = {
  x: number
  y: number
  rightX?: number
  rightY?: number
  moves: number[]
}

export class Ghost {
  direction: number
  randomTargetIndex: number
  target: { x: number; y: number }
  frameCount: number
  currentFrame: number

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
    this.direction = DIRECTION_RIGHT
    this.imageX = imageX
    this.imageY = imageY
    this.imageHeight = imageHeight
    this.imageWidth = imageWidth
    this.range = range
    this.randomTargetIndex = Math.floor(Math.random() * 4)
    this.target = randomTargetsForGhosts[this.randomTargetIndex]
    this.frameCount = 7
    this.currentFrame = 1
    setInterval(() => {
      this.changeRandomDirection()
    }, 10000)
  }

  isInRange(pacman: Pacman) {
    let xDistance = Math.abs(pacman.getMapX() - this.getMapX())
    let yDistance = Math.abs(pacman.getMapY() - this.getMapY())
    if (
      Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range
    ) {
      return true
    }
    return false
  }

  changeRandomDirection() {
    let addition = 1
    this.randomTargetIndex += addition
    this.randomTargetIndex = this.randomTargetIndex % 4
  }

  moveProcess(pacman: Pacman) {
    if (this.isInRange(pacman)) {
      this.target = pacman
    } else {
      this.target = randomTargetsForGhosts[this.randomTargetIndex]
    }
    this.changeDirectionIfPossible()
    this.moveForwards()
    if (this.checkCollisions()) {
      this.moveBackwards()
      return
    }
  }

  moveBackwards() {
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

  moveForwards() {
    switch (this.direction) {
      case 4: // Right
        this.x += this.speed
        break
      case 3: // Up
        this.y -= this.speed
        break
      case 2: // Left
        this.x -= this.speed
        break
      case 1: // Bottom
        this.y += this.speed
        break
    }
  }

  checkCollisions() {
    let isCollided = false
    if (
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
    ) {
      isCollided = true
    }
    return isCollided
  }

  changeDirectionIfPossible() {
    let tempDirection = this.direction
    this.direction = this.calculateNewDirection(
      MAP,
      Math.floor(this.target.x / blockSize),
      Math.floor(this.target.y / blockSize)
    )
    if (typeof this.direction == "undefined") {
      this.direction = tempDirection
      return
    }
    if (
      this.getMapY() != this.getMapYRightSide() &&
      (this.direction == DIRECTION_LEFT || this.direction == DIRECTION_RIGHT)
    ) {
      this.direction = DIRECTION_UP
    }
    if (
      this.getMapX() != this.getMapXRightSide() &&
      this.direction == DIRECTION_UP
    ) {
      this.direction = DIRECTION_LEFT
    }
    this.moveForwards()
    if (this.checkCollisions()) {
      this.moveBackwards()
      this.direction = tempDirection
    } else {
      this.moveBackwards()
    }
  }

  calculateNewDirection(map: number[][], destX: number, destY: number) {
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
      let poped = queue.shift()
      if (poped !== undefined)
        if (poped.x == destX && poped.y == destY) {
          return poped.moves[0]
        } else {
          mp[poped.y][poped.x] = 1
          let neighborList = this.addNeighbors(poped, mp)
          for (let i = 0; i < neighborList.length; i++) {
            queue.push(neighborList[i])
          }
        }
    }

    return 1 // direction
  }

  addNeighbors(poped: Queue, mp: typeof MAP) {
    let queue = []
    let numOfRows = mp.length
    let numOfColumns = mp[0].length

    if (
      poped.x - 1 >= 0 &&
      poped.x - 1 < numOfRows &&
      mp[poped.y][poped.x - 1] != 1
    ) {
      let tempMoves = poped.moves.slice()
      tempMoves.push(DIRECTION_LEFT)
      queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves })
    }
    if (
      poped.x + 1 >= 0 &&
      poped.x + 1 < numOfRows &&
      mp[poped.y][poped.x + 1] != 1
    ) {
      let tempMoves = poped.moves.slice()
      tempMoves.push(DIRECTION_RIGHT)
      queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves })
    }
    if (
      poped.y - 1 >= 0 &&
      poped.y - 1 < numOfColumns &&
      mp[poped.y - 1][poped.x] != 1
    ) {
      let tempMoves = poped.moves.slice()
      tempMoves.push(DIRECTION_UP)
      queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves })
    }
    if (
      poped.y + 1 >= 0 &&
      poped.y + 1 < numOfColumns &&
      mp[poped.y + 1][poped.x] != 1
    ) {
      let tempMoves = poped.moves.slice()
      tempMoves.push(DIRECTION_BOTTOM)
      queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves })
    }
    return queue
  }

  getMapX() {
    let mapX = Math.floor(this.x / blockSize)
    return mapX
  }

  getMapY() {
    let mapY = Math.floor(this.y / blockSize)
    return mapY
  }

  getMapXRightSide() {
    let mapX = Math.floor((this.x * 0.99 + blockSize) / blockSize)
    return mapX
  }

  getMapYRightSide() {
    let mapY = Math.floor((this.y * 0.99 + blockSize) / blockSize)
    return mapY
  }

  changeAnimation() {
    this.currentFrame =
      this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1
  }

  draw() {
    gameContext.save()
    gameContext.drawImage(
      ghostFrames,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    )
    gameContext.restore()

    // debug arc of pacman detection

    // gameContext.beginPath()
    // gameContext.strokeStyle = "red"
    // gameContext.arc(
    //   this.x + blockSize / 2,
    //   this.y + blockSize / 2,
    //   this.range * blockSize,
    //   0,
    //   2 * Math.PI
    // )
    // gameContext.stroke()
  }
}
