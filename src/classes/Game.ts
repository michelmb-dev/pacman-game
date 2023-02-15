import { Ghost } from "./Ghosts"
import {
  blockSize,
  canvas,
  createCircle,
  creatRect,
  DIRECTION_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  MAP,
} from "../utils"
import { Pacman } from "./Pacman"

/**
 * Create Pacman Game
 * @class
 */
export class Game {
  private live: number = 3
  private readonly pacman: Pacman = this.createPacman()
  private readonly ghosts: Ghost[] = []
  private fps: number = 30
  private readonly ghostCount: number = 2
  private readonly wallColor: string = "#662DCA"
  private readonly wallInnerColor: string = "#000000"
  private readonly wallSpaceWidth: number = blockSize / 1.6
  private readonly wallOffset: number = (blockSize - this.wallSpaceWidth) / 2

  constructor() {}

  /**
   * Initiate a new game
   * @public
   */
  init(): void {
    this.createGhosts()
    this.activeGameControl()
    setInterval(() => this.gameLoop(), 1000 / this.fps)
  }

  /**
   * Update and draw the game
   * @private
   */
  private gameLoop() {
    this.draw()
    this.updatePacman()
    this.updateGhosts()
    if (this.pacman.checkGhostCollision(this.ghosts)) {
      this.gameOver()
    }
  }

  /**
   * Restart the game
   * @private
   */
  private restartGame() {
    this.pauseGame()
    this.pacman.reset()
  }

  /**
   * Pause the game
   * @private
   */
  private pauseGame() {
    this.fps = 0
  }

  /**
   * game over and restart the game if there is still live
   * @private
   */
  private gameOver() {
    this.live--
    if (this.live >= 1) {
      this.restartGame()
    }
    if (this.live === 0) {
      console.log("Game Over")
    }
  }

  /**
   * Create Pacman player
   * @private
   */
  private createPacman() {
    return new Pacman(blockSize, blockSize, blockSize, blockSize, 6, 8)
  }

  /**
   * Update pacman position and check if it's eating food or fruit
   * @private
   */
  private updatePacman() {
    this.pacman.moveProcess()
    if (this.isAllFoodEaten()) {
      console.log("You win!")
    }

    if (this.pacman.isEatingFood()) {
      for (let i = 0; i < MAP.length; i++) {
        for (let j = 0; j < MAP[0].length; j++) {
          if (
            MAP[i][j] === 2 &&
            this.pacman.getMapX() === j &&
            this.pacman.getMapY() === i
          ) {
            MAP[i][j] = 3
            //score += 10
            //eatBlobSound.volume = 0.2
            //eatBlobSound.play()
          }
        }
      }
    } else if (this.pacman.isEatingFruit()) {
      for (let i = 0; i < MAP.length; i++) {
        for (let j = 0; j < MAP[0].length; j++) {
          if (
            MAP[i][j] === 4 &&
            this.pacman.getMapX() === j &&
            this.pacman.getMapY() === i
          ) {
            MAP[i][j] = 3
            //score += 100
            //eatFruitSound.volume = 1
            //eatFruitSound.play()
          }
        }
      }
    }
  }

  /**
   * Create ghosts for the game and return them
   * @private
   */
  private createGhosts() {
    let ghostImageLocations = [
      { x: 0, y: 0 },
      { x: 176, y: 0 },
      { x: 0, y: 121 },
      { x: 176, y: 121 },
    ]
    for (let i = 0; i < this.ghostCount; i++) {
      let newGhost = new Ghost(
        9 * blockSize + (i % 2 == 0 ? 0 : 1) * blockSize,
        12 * blockSize + (i % 2 == 0 ? 0 : 1) * blockSize,
        blockSize - 2,
        blockSize - 2,
        this.pacman.speed / 2,
        ghostImageLocations[i % 4].x,
        ghostImageLocations[i % 4].y,
        124,
        116,
        9 + i
      )
      this.ghosts.push(newGhost)
    }
    return this.ghosts
  }

  /**
   * update the ghosts position and direction
   * @private
   */
  private updateGhosts() {
    for (let i = 0; i < this.ghosts.length; i++) {
      this.ghosts[i].moveProcess(this.pacman)
    }
  }

  /**
   * Draw the game on the canvas
   * @private
   */
  private draw() {
    creatRect(0, 0, canvas.width, canvas.height, "black")
    this.drawWalls()
    this.drawFoods()
    this.drawGhosts()
    this.pacman.draw()
  }

  /**
   * Draw the walls on the canvas
   * @private
   */
  private drawWalls() {
    for (let i = 0; i < MAP.length; i++) {
      for (let j = 0; j < MAP[0].length; j++) {
        if (MAP[i][j] === 1) {
          creatRect(
            j * blockSize,
            i * blockSize,
            blockSize,
            blockSize,
            this.wallColor
          )
          if (j > 0 && MAP[i][j - 1] === 1) {
            creatRect(
              j * blockSize,
              i * blockSize + this.wallOffset,
              this.wallSpaceWidth + this.wallOffset,
              this.wallSpaceWidth,
              this.wallInnerColor
            )
          }
          if (j < MAP[0].length - 1 && MAP[i][j + 1] === 1) {
            creatRect(
              j * blockSize + this.wallOffset,
              i * blockSize + this.wallOffset,
              this.wallSpaceWidth + this.wallOffset,
              this.wallSpaceWidth,
              this.wallInnerColor
            )
          }
          if (i > 0 && MAP[i - 1][j] === 1) {
            creatRect(
              j * blockSize + this.wallOffset,
              i * blockSize,
              this.wallSpaceWidth,
              this.wallSpaceWidth + this.wallOffset,
              this.wallInnerColor
            )
          }
          if (i < MAP.length - 1 && MAP[i + 1][j] === 1) {
            creatRect(
              j * blockSize + this.wallOffset,
              i * blockSize + this.wallOffset,
              this.wallSpaceWidth,
              this.wallSpaceWidth + this.wallOffset,
              this.wallInnerColor
            )
          }
        }
      }
    }
  }

  /**
   * Draw the foods on the canvas
   * @private
   */
  private drawFoods() {
    for (let i = 0; i < MAP.length; i++) {
      for (let j = 0; j < MAP[0].length; j++) {
        if (MAP[i][j] === 2) {
          createCircle(
            Math.floor(j * blockSize + blockSize / 2),
            Math.floor(i * blockSize + blockSize / 2),
            4,
            "#FEB897"
          )
        }
        if (MAP[i][j] === 4) {
          createCircle(
            Math.floor(j * blockSize + blockSize / 2),
            Math.floor(i * blockSize + blockSize / 2),
            8,
            "#FEB897"
          )
        }
      }
    }
  }

  /**
   * Draw the ghosts on the canvas
   * @private
   */
  private drawGhosts() {
    for (let i = 0; i < this.ghosts.length; i++) {
      this.ghosts[i].draw()
    }
  }

  /**
   * Check if all the food is eaten
   * @private
   */
  private isAllFoodEaten() {
    for (let i = 0; i < MAP.length; i++) {
      for (let j = 0; j < MAP[0].length; j++) {
        if (MAP[i][j] === 2) {
          return false
        }
      }
    }
    return true
  }

  /**
   * Active the game controls keyboard
   * @private
   */
  private activeGameControl() {
    document.addEventListener("keydown", (event) => {
      let k = event.key
      if (k == "ArrowLeft" || k == "q") {
        // left arrow or q
        this.pacman.nextDirection = DIRECTION_LEFT
      } else if (k == "ArrowUp" || k == "z") {
        // up arrow or z
        this.pacman.nextDirection = DIRECTION_UP
      } else if (k == "ArrowRight" || k == "d") {
        // right arrow or d
        this.pacman.nextDirection = DIRECTION_RIGHT
      } else if (k == "ArrowDown" || k == "s") {
        // bottom arrow or s
        this.pacman.nextDirection = DIRECTION_BOTTOM
      }
    })
  }
}
