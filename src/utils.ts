/* Direction of the pacman or the ghost. */
export const DIRECTION_RIGHT = 4
export const DIRECTION_UP = 3
export const DIRECTION_LEFT = 2
export const DIRECTION_BOTTOM = 1

export const canvas: HTMLCanvasElement = document.querySelector("#canvas")!
export const gameContext: CanvasRenderingContext2D = canvas.getContext("2d")!

export enum GameState {
  LOBBY,
  PLAYING,
  PAUSE,
  RESUME,
  GAME_OVER,
}

/* A map of the game. */
const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 4, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

export let MAP = INITIAL_MAP.map((row) => row.slice())

export function resetMap(): void {
  // Utilisez la fonction map pour créer une copie profonde de la MAP initiale
  MAP = INITIAL_MAP.map((row) => row.slice())
}

/* Block size of the pacman. */
export const blockSize = 24

/* Creating a list of coordinates for the ghosts to start at. */
export const randomTargetsForGhosts = [
  { x: blockSize, y: blockSize },
  { x: blockSize, y: (MAP.length - 2) * blockSize },
  { x: (MAP[0].length - 2) * blockSize, y: blockSize },
  {
    x: (MAP[0].length - 2) * blockSize,
    y: (MAP.length - 2) * blockSize,
  },
]

/**
 * This function creates a rectangle with the given parameters and fills it with the given color.
 *
 * The first line of the function is a comment. Comments ignored by the computer, but they are
 * useful for humans
 * @param {number} x - The x coordinate of the top left corner of the rectangle.
 * @param {number} y - number,
 * @param {number} width - number,
 * @param {number} height - number,
 * @param {string} color - string
 */
export const creatRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  gameContext.fillStyle = color
  gameContext.fillRect(x, y, width, height)
}

export const createCircle = (
  x: number,
  y: number,
  radius: number,
  color: string
) => {
  gameContext.beginPath()
  gameContext.arc(x, y, radius, 0, Math.PI * 2)
  gameContext.fillStyle = color
  gameContext.fill()
}

export const createDisplayText = (text: string, color: string) => {
  gameContext.font = "700 40px Sans-serif"
  gameContext.fillStyle = color
  gameContext.textAlign = "center"
  gameContext.fillText(text, canvas.width / 2, canvas.height / 4)
}

/**
 * Play Sound
 * @param {string} audio
 * @param {number} volume
 */
export const playSound = (audio: string, volume: number) => {
  const sound = new Audio(audio)
  sound.volume = volume
  sound.loop = false
  sound.play()
}

export const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
