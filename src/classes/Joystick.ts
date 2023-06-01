import { DIRECTION } from "../utils"

export class Joystick {
  private active: boolean = false
  public canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private strokeWidth: number = 2
  private readonly joystickRadius: number
  private readonly joystickX: number
  private readonly joystickY: number
  private position: { x: number; y: number } = { x: 0, y: 0 }
  private lastDirection: DIRECTION | null = null
  private joystickColor: string = "rgb(97,58,189)"
  private joystickStrokeColor: string = "rgb(140,140,140)"

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.joystickRadius = this.canvas.width / 2 - this.strokeWidth
    this.joystickX = this.canvas.width / 2
    this.joystickY = this.canvas.height / 2
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D
    this.canvas.addEventListener("touchstart", () => this.handleTouchStart(), {
      passive: true,
    })
    this.canvas.addEventListener(
      "touchmove",
      (event) => this.handleTouchMove(event),
      { passive: true }
    )
    this.canvas.addEventListener("touchend", () => this.handleTouchEnd(), {
      passive: true,
    })
  }

  public init(): void {
    this.draw()
  }

  public getDirection(): DIRECTION | null {
    const { x, y } = this.position
    const angle: number = Math.atan2(y, x)
    const angleDegrees: number = angle * (180 / Math.PI)
    if (this.active) {
      if (angleDegrees >= -135 && angleDegrees <= -45) {
        return DIRECTION.UP
      } else if (angleDegrees > -45 && angleDegrees < 45) {
        return DIRECTION.RIGHT
      } else if (angleDegrees >= 45 && angleDegrees <= 135) {
        return DIRECTION.DOWN
      } else if (angleDegrees >= 135 || angleDegrees < -135) {
        return DIRECTION.LEFT
      } else {
        return null
      }
    } else {
      return this.lastDirection
    }
  }

  private handleTouchStart(): void {
    this.active = true
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.active) {
      const touch = event.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const touchX = touch.clientX - rect.left - this.joystickX
      const touchY = touch.clientY - rect.top - this.joystickY
      const distance = Math.sqrt(touchX * touchX + touchY * touchY)

      if (distance <= this.joystickRadius / 2.6) {
        this.position = { x: touchX, y: touchY }
      } else {
        const angle = Math.atan2(touchY, touchX)
        const limitedX = Math.cos(angle) * (this.joystickRadius / 2.6)
        const limitedY = Math.sin(angle) * (this.joystickRadius / 2.6)
        this.position = { x: limitedX, y: limitedY }
      }
      this.draw()
    }
  }

  private handleTouchEnd(): void {
    this.active = false
    this.position = { x: 0, y: 0 }
    this.draw()
    this.lastDirection = this.getDirection()
  }

  private drawPad(position: typeof this.position): void {
    const padRadius: number = this.joystickRadius / 1.6
    const padX: number = this.joystickX + position.x
    const padY: number = this.joystickY + position.y

    this.ctx.beginPath()
    this.ctx.arc(padX, padY, padRadius, 0, 2 * Math.PI)
    this.ctx.fillStyle = this.joystickColor
    this.ctx.fill()
  }

  private drawJoystick(): void {
    this.ctx.beginPath()
    this.ctx.lineWidth = this.strokeWidth
    this.ctx.arc(
      this.joystickX,
      this.joystickY,
      this.joystickRadius,
      0,
      2 * Math.PI
    )
    this.ctx.strokeStyle = this.joystickStrokeColor
    this.ctx.stroke()
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawJoystick()
    this.drawPad(this.position)
  }
}
