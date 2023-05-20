import { Ghost } from "./Ghost"
import {
  blockSize,
  canvas,
  createCircle,
  createDisplayText,
  creatRect,
  DIRECTION_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  GameState,
  MAP,
  playSound,
  resetMap,
  wait,
} from "../utils"
import { Pacman } from "./Pacman"

/**
 * Create Pacman Game
 * @class
 */
export class Game {
  private state: GameState = GameState.LOBBY
  private score: number = 0
  private lives: number = 0
  private livesMax: number = 5
  private readonly pacman: Pacman = this.createPacman()
  private readonly ghosts: Ghost[] = []
  private isRunning: boolean = false
  private gameInterval: number | null = null
  private fps: number = 30
  private readonly ghostCount: number = 5
  private readonly wallColor: string = "#662DCA"
  private readonly wallInnerColor: string = "#000000"
  private readonly wallSpaceWidth: number = blockSize / 1.6
  private readonly wallOffset: number = (blockSize - this.wallSpaceWidth) / 2
  private btnMenu: HTMLButtonElement = document.querySelector(".btn-menu")!

  constructor() {
    this.createGhosts()
  }

  /**
   * Initiate a new game
   * @public
   */
  init(): void {
    switch (this.state) {
      case GameState.LOBBY:
        this.startMenuUI()
        break
      case GameState.PLAYING:
        this.startGame()
        break
      case GameState.PAUSE:
        this.pauseMenuUI()
        break
      case GameState.RESUME:
        this.resumeGame()
        break
      case GameState.GAME_OVER:
        this.stopGame()
        this.gameOverUI()
        break
    }
  }

  /**
   * Draw the menu on the canvas
   * @private
   */
  private startMenuUI() {
    this.drawWalls()
    this.drawLives()
    creatRect(0, 0, canvas.width, canvas.height, "#000000CC")
    createDisplayText("PACMAN", "#FFFFFF")
    this.btnMenu.onclick = () => {
      playSound("sounds/music.mp3", 0.1)
      this.state = GameState.PLAYING
      this.init()
    }
  }

  private startGame(): void {
    this.lives = this.livesMax
    this.isRunning = true
    if (this.isRunning) {
      this.activeGameControl()
      this.gameInterval = setInterval(
        () => this.gameLoopIntervalCallback(),
        1000 / this.fps
      )
      this.btnMenu.style.display = "none"
    }
  }

  /**
   *  Stop the gameInterval
   * @private
   */
  private stopGame(): void {
    if (this.gameInterval !== null) {
      clearInterval(this.gameInterval)
      this.isRunning = false
    }
  }

  /**
   * Update and drawPlayingGame the game
   * @private
   */
  private gameLoopIntervalCallback() {
    this.drawPlayingGame()
    if (this.isRunning && !this.pacman.isRotating) {
      this.updatePacman()
      if (this.pacman.checkGhostCollision(this.ghosts)) {
        this.resetGhosts()
        this.gameOver()
      }
      this.updateGhosts()
    }
  }

  private resumeGame() {
    this.btnMenu.style.display = "none"
    this.gameInterval = setInterval(
      () => this.gameLoopIntervalCallback(),
      1000 / this.fps
    )
    this.isRunning = true
  }

  /**
   * game over and restart the game if there is still live.
   * @private
   */
  private gameOver() {
    this.lives--
    this.drawLives()
    playSound("sounds/die.mp3", 0.2)
    if (this.lives > 0) {
      this.pacman.rotateAnimation(2, 1000)
      wait(1100).then(() => {
        this.pacman.reset()
      })
    }
    if (this.lives === 0) {
      this.pacman.rotateAnimation(2, 1000)
      wait(1100).then(() => {
        this.state = GameState.GAME_OVER
        this.init()
      })
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
   * Update pacman position and check if it is eating food or fruit.
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
            this.score += 10
          }
        }
      }
      playSound("sounds/eat_ball.mp3", 0.1)
    } else if (this.pacman.isEatingFruit()) {
      for (let i = 0; i < MAP.length; i++) {
        for (let j = 0; j < MAP[0].length; j++) {
          if (
            MAP[i][j] === 4 &&
            this.pacman.getMapX() === j &&
            this.pacman.getMapY() === i
          ) {
            MAP[i][j] = 3
            this.score += 100
          }
        }
      }
      this.ghosts.forEach((ghost) => {
        ghost.setFrightenedMode(5000)
        playSound("sounds/frightened.mp3", 0.2)
      })
      playSound("sounds/eat_fruit.mp3", 0.1)
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
  private drawPlayingGame() {
    creatRect(0, 0, canvas.width, canvas.height, "black")
    this.drawWalls()
    this.drawFoods()
    this.drawGhosts()
    this.pacman.draw()
    this.drawScore()
    this.drawLives()
  }

  private gameOverUI(): void {
    creatRect(0, 0, canvas.width, canvas.height, "#00000099")
    createDisplayText("GAME OVER", "#FFFFFF")
    this.btnMenu.style.display = "block"
    this.btnMenu.innerHTML = "Restart"
    this.btnMenu.onclick = () => {
      playSound("sounds/music.mp3", 0.1)
      this.resetGame()
      this.resetGhosts()
      this.state = GameState.PLAYING
      this.init()
    }
  }

  private pauseMenuUI(): void {
    creatRect(0, 0, canvas.width, canvas.height, "#00000099")
    createDisplayText("GAME PAUSED", "#FFFFFF")
    this.stopGame()
    this.btnMenu.style.display = "block"
    this.btnMenu.innerHTML = "Resume"
    this.btnMenu.onclick = () => {
      this.state = GameState.RESUME
      this.init()
    }
  }

  private resetGhosts(): void {
    for (let i = 0; i < this.ghosts.length; i++) {
      this.ghosts[i].x = 9 * blockSize + (i % 2 == 0 ? 0 : 1) * blockSize
      this.ghosts[i].y = 12 * blockSize + (i % 2 == 0 ? 0 : 1) * blockSize
    }
  }

  private resetGame(): void {
    resetMap()
    this.resetGhosts()
    this.pacman.reset()
    this.score = 0
    this.lives = this.livesMax
  }

  /**
   * drawPlayingGame the score on the canvas
   * @private
   */
  private drawScore() {
    const displayScore = document.querySelector("#score")!
    displayScore.innerHTML = this.score.toString()
  }

  private drawLives = (): void => {
    const displayLives = document.querySelector("#lives")!
    displayLives!.innerHTML = this.lives.toString()
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
        // a left arrow or q
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
      if (k == "Escape") {
        // escape key to pause the game
        if (
          this.state !== GameState.PAUSE &&
          this.state !== GameState.GAME_OVER
        ) {
          this.state = GameState.PAUSE
          this.init()
        }
      }
    })
  }
}
