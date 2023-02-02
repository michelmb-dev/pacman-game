import {
  DIRECTION_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  MAP,
  blockSize,
  canvas,
  creatRect,
  drawScore,
} from "./utils"
import { Ghost } from "./ghosts"
import { Pacman, drawRemainingLives } from "./pacman"
import "./style.css"

let fps = 30
let score = 0

let lives = 5

let ghosts: Ghost[] = []
let ghostCount = 4
let ghostImageLocations = [
  { x: 0, y: 0 },
  { x: 176, y: 0 },
  { x: 0, y: 121 },
  { x: 176, y: 121 },
]

let wallColor = "#662DCA"
let wallInnerColor = "#000000"
let wallSpaceWidth = blockSize / 1.2
let wallOffset = (blockSize - wallSpaceWidth) / 2

let pacman: Pacman = new Pacman(
  blockSize,
  blockSize,
  blockSize,
  blockSize,
  blockSize / 5
)

const gameLoop = () => {
  update()
  draw()
}

const restartPacmanAndGhosts = () => {
  pacman = new Pacman(blockSize, blockSize, blockSize, blockSize, blockSize / 5)
  createGhosts()
}

const onGhostCollision = () => {
  lives--
  restartPacmanAndGhosts()
  if (lives === 0) {
  }
}

const update = () => {
  pacman.moveProcess()
  pacman.eat(score)
  updateGhosts()
  if (pacman.checkGhostCollision(ghosts)) {
    onGhostCollision()
  }
}

const drawFoods = () => {
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

const drawWalls = () => {
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

const createGhosts = () => {
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

const updateGhosts = () => {
  for (let i = 0; i < ghosts.length; i++) {
    ghosts[i].moveProcess(pacman)
  }
}

const drawGhosts = () => {
  for (let i = 0; i < ghosts.length; i++) {
    ghosts[i].draw()
  }
}

const draw = () => {
  creatRect(0, 0, canvas.width, canvas.height, "black")
  drawWalls()
  drawFoods()
  drawGhosts()
  pacman.draw()
  drawRemainingLives(lives)
  drawScore(score)
}

createGhosts()
gameLoop()
setInterval(gameLoop, 1000 / fps)

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
