type Player = "A" | "B"
type Cell  = Player | null

class Game {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  cellsX: number
  cellsY: number
  cellSize: number
  width: number
  height: number
  grid: Cell[][]
  debugGrid: boolean[][]
  highlighted: boolean[][]
  winner: Player
  currentPlayer: Player
  isRunning = false
  lastTime: number
  fpsInterval = 20
  animatingDrop = false
  dropAnimationY = 0
  lastDrop: { clickCol: number, clickRow: number, row: number, col: number, player: Player }
  canAcceptInput: boolean
  debug: boolean
  startGame: () => void
}

export { Player, Cell, Game }