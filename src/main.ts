import {
  DIRECTION_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  MAP,
  blockSize,
  canvas,
  creatRect,
} from "./utils"
import { Ghost } from "./ghosts"
import { Pacman, drawRemainingLives, drawScore } from "./pacman"
import "./style.css"

// Game Variables
let fps = 30
let lives = 3
let wallColor = "#662DCA"
let wallInnerColor = "#000000"
let wallSpaceWidth = blockSize / 1.2
let wallOffset = (blockSize - wallSpaceWidth) / 2

// Ghosts Variables
let ghosts: Ghost[] = []
let ghostCount = 4
let ghostImageLocations = [
  { x: 0, y: 0 },
  { x: 176, y: 0 },
  { x: 0, y: 121 },
  { x: 176, y: 121 },
]

/* Creating a new instance of the Pacman class. */
let pacman: Pacman = new Pacman(
  blockSize,
  blockSize,
  blockSize,
  blockSize,
  blockSize / 5
)

/**
 * The gameLoop function calls the update and draw functions, and then calls itself again.
 */
const gameLoop = (): void => {
  update()
  draw()
}

/**
 * It creates a new Pacman and creates the ghosts
 */
const restartPacmanAndGhosts = (): void => {
  pacman = new Pacman(blockSize, blockSize, blockSize, blockSize, blockSize / 5)
  createGhosts()
}

/**
 * If the player collides with a ghost, then the player loses a life and the game restarts
 */
const onGhostCollision = (): void => {
  lives--
  restartPacmanAndGhosts()
  if (lives === 0) {
  }
}

/**
 * It moves Pacman, checks if he's eaten a food, moves the ghosts, and checks if Pacman has collided
 * with a ghost
 */
const update = (): void => {
  pacman.moveProcess()
  pacman.eat()
  updateGhosts()
  if (pacman.checkGhostCollision(ghosts)) {
    onGhostCollision()
  }
}

/**
 * It loops through the map and draws a rectangle at the position of each food
 */
const drawFoods = (): void => {
  for (let i = 0; i < MAP.length; i++) {
    for (let j = 0; j < MAP[0].length; j++) {
      if (MAP[i][j] == 2) {
        creatRect(
          j * blockSize + blockSize / 3,
          i * blockSize + blockSize / 3,
          blockSize / 3,
          blockSize / 3,
          "#FEB897"
        )
      }
    }
  }
}

/**
 * It draws the walls of the maze
 */
const drawWalls = (): void => {
  for (let i = 0; i < MAP.length; i++) {
    for (let j = 0; j < MAP[0].length; j++) {
      if (MAP[i][j] === 1) {
        creatRect(j * blockSize, i * blockSize, blockSize, blockSize, wallColor)
      }
      if (j > 0 && MAP[i][j - 1] === 1) {
        creatRect(
          j * blockSize,
          i * blockSize + wallOffset,
          wallSpaceWidth + wallOffset,
          wallSpaceWidth,
          wallInnerColor
        )
      }
      if (j < MAP[0].length - 1 && MAP[i][j + 1] === 1) {
        creatRect(
          j * blockSize + wallOffset,
          i * blockSize + wallOffset,
          wallSpaceWidth + wallOffset,
          wallSpaceWidth,
          wallInnerColor
        )
      }
      if (i > 0 && MAP[i - 1][j] === 1) {
        creatRect(
          j * blockSize + wallOffset,
          i * blockSize,
          wallSpaceWidth,
          wallSpaceWidth + wallOffset,
          wallInnerColor
        )
      }
      if (i < MAP.length - 1 && MAP[i + 1][j] === 1) {
        creatRect(
          j * blockSize + wallOffset,
          i * blockSize + wallOffset,
          wallSpaceWidth,
          wallSpaceWidth + wallOffset,
          wallInnerColor
        )
      }
    }
  }
}

/**
 * It creates a new ghost for each of the four ghost types, and then pushes each of those ghosts into
 * the ghosts array
 */
const createGhosts = (): void => {
  ghosts = []
  for (let i = 0; i < ghostCount; i++) {
    let newGhost = new Ghost(
      9 * blockSize + (i % 2 == 0 ? 0 : 1) * blockSize,
      10 * blockSize + (i % 2 == 0 ? 0 : 1) * blockSize,
      blockSize - 2,
      blockSize - 2,
      pacman.speed / 2,
      ghostImageLocations[i % 4].x,
      ghostImageLocations[i % 4].y,
      124,
      116,
      6 + i
    )
    ghosts.push(newGhost)
  }
}

/**
 * It loops through the ghosts array and calls the moveProcess method on each ghost
 */
const updateGhosts = () => {
  for (let i = 0; i < ghosts.length; i++) {
    ghosts[i].moveProcess(pacman)
  }
}

/**
 * It loops through the ghosts array and calls the draw method on each ghost
 */
const drawGhosts = () => {
  for (let i = 0; i < ghosts.length; i++) {
    ghosts[i].draw()
  }
}

/**
 * It draws the background, the walls, the food, the ghosts, Pacman, the score, and the remaining lives
 */
const draw = () => {
  creatRect(0, 0, canvas.width, canvas.height, "black")
  drawWalls()
  drawFoods()
  drawGhosts()
  pacman.draw()
  drawScore()
  drawRemainingLives(lives)
}

// init a game
createGhosts()
gameLoop()
setInterval(gameLoop, 1000 / fps)

// It's listening for keydown events and then setting the nextDirection property of the pacman object.
window.addEventListener("keydown", (event) => {
  let k = event.keyCode
  console.log("key => " + k)
  setTimeout(() => {
    if (k == 37 || k == 81) {
      // left arrow or q
      pacman.nextDirection = DIRECTION_LEFT
    } else if (k == 38 || k == 90) {
      // up arrow or z
      pacman.nextDirection = DIRECTION_UP
    } else if (k == 39 || k == 68) {
      // right arrow or d
      pacman.nextDirection = DIRECTION_RIGHT
    } else if (k == 40 || k == 83) {
      // bottom arrow or s
      pacman.nextDirection = DIRECTION_BOTTOM
    }
  }, 1)
})
