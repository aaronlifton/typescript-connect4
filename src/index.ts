import { checkPositionForWin } from './winChecks'
import * as d3 from 'd3-ease'
import './style.css'

const container = document.createElement('div')
container.id = 'game'

const el = document.createElement('canvas')
el.id  = 'canvas'
container.appendChild(el)
document.body.appendChild(container)

const div = document.createElement('div')
const btn = document.createElement('button')
btn.id  = 'startOverBtn'
btn.innerHTML = 'Start Over'
div.appendChild(btn)
document.body.appendChild(div)

type Cell  = "A" | "B" | "X" | null
type Player = "A" | "B"
class Game {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  cellsX = 8
  cellsY = 8
  cellSize = 60
  width = this.cellsX * this.cellSize
  height = this.cellsY * this.cellSize
  grid: Cell[][]
  highlighted: boolean[][]
  winner: Player
  currentPlayer: Player = "A"
  isRunning = false
  lastTime: number
  fpsInterval = 20
  animatingDrop = false
  dropAnimationY = 0
  lastDrop: { clickCol: number, clickRow: number, row: number, col: number, player: Player }
  canAcceptInput = true

  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.canvas.width = this.cellsX * (this.cellSize + 1)
    this.canvas.height = this.cellsY * (this.cellSize + 1)
    this.context = this.canvas.getContext('2d')
    this.lastTime = window.performance.now();
  }

  setupGrid() {
    this.grid = []
    this.highlighted = []
    for(let row = 0; row < this.cellsY; row++) {
      this.grid.push([])
      this.highlighted.push([])
      for(let col = 0; col < this.cellsX; col++) {
        this.grid[this.grid.length - 1].push(null)
        this.highlighted[this.highlighted.length - 1].push(false)
      }
    }
  }

  registerHandlers() {
    this.canvas.onmousemove = (e) => {
      const x = e.clientX,
        y = e.clientY,
        i = 0;

      if (!this.canAcceptInput) return

      const col = Math.floor(x / this.cellSize)
      const row = Math.floor(y / this.cellSize)

      if (col >= this.cellsX || row >= this.cellsY) return

      this.clearHighlights()
      this.highlighted[row][col] = true
    }

    this.canvas.onclick = (e) => {
      const x = e.clientX,
        y = e.clientY,
        i = 0;

      if (!this.canAcceptInput) return

      const col = Math.floor(x / this.cellSize)
      const row = Math.floor(y / this.cellSize)

      if (col >= this.cellsX || row >= this.cellsY) return

      this.clearHighlights()
      this.handleBoxClick(row, col)
    }
  }

  handleBoxClick(row: number, col: number) {
    const player = this.currentPlayer
    const {row: placedRow, col: placedCol} = this.dropPiece(col)
    if (typeof row == 'undefined' || typeof col == 'undefined') return

    this.lastDrop = {
      clickRow: row,
      clickCol: col,
      row: placedRow,
      col: placedCol,
      player
    }
    this.triggerAnimateDrop()
  }

  clearHighlights() {
    for(let row = 0; row < this.cellsY; row++) {
      for(let col = 0; col < this.cellsY; col++) {
        this.highlighted[row][col] = false
      }
    }
  }

  drawHighlight() {
    for (let row = 0; row < this.cellsY; row++) {
      for (let col = 0; col < this.cellsY; col++) {
        if (!!this.grid[row][col]) continue

        if (this.highlighted[row][col] == true) {
          const color = this.colorFromPlayer(this.currentPlayer)
          this.drawBlock(row, col, color)
        } else {
          this.clearBlock(row, col)
        }
      }
    }
  }

  private colorFromPlayer(player: Player) {
    return player == "A" ? 'red' : 'blue'
  }

  startGame() {
    this.setupGrid()
    this.registerHandlers()
    this.winner = null
    this.lastDrop = null
    this.animatingDrop = false
    this.canAcceptInput = true
    this.isRunning = true
    this.runGameLoop()
  }
  
  runGameLoop(newTime?: number) {
    if (!this.isRunning) {
      this.handleWin()
      return
    }

    window.requestAnimationFrame(this.runGameLoop.bind(this)) 

    const now = newTime;
    const timeElapsed = now - this.lastTime
    
    if (timeElapsed > this.fpsInterval) {

      this.lastTime = now - (timeElapsed % this.fpsInterval);

      this.drawGrid()
      this.drawBlocks()
      this.drawHighlight()
      this.animateDrop()
      // this.clearDebug()

      if (this.winner) {
        this.isRunning = false
      }
    }
  }

  handleWin() {
    this.canAcceptInput = false
    const winnerColor = this.colorFromPlayer(this.winner)    

    document.body.style.cursor = "default";
    this.context.font = "30px Arial";
    this.context.fillStyle = 'black';

    const text = `${winnerColor} won!`
    const textMetrics = this.context.measureText(text)
    this.context.fillText(
      text,
      (this.width / 2) - (textMetrics.width / 2),
      (this.height / 2) - (textMetrics.actualBoundingBoxAscent / 2)
    )
  }

  triggerAnimateDrop() {
    document.body.style.cursor = "wait";
    this.canAcceptInput = false
    this.animatingDrop = true
  }

  handleDropFinish(row: number, col: number, player: Player) {
    this.animatingDrop = false
    this.dropAnimationY = 0
    this.grid[row][col] = player
    document.body.style.cursor = "default"
  }
  
  animateDrop() {
    if (!this.lastDrop || !this.animatingDrop) return

    window.requestAnimationFrame(this.animateDrop.bind(this))

    const {clickRow, clickCol, row, col, player} = this.lastDrop

    if ((clickRow * this.cellSize) + this.dropAnimationY >= (this.cellSize * row)) {
      this.handleDropFinish(row, clickCol, player)
      const won = checkPositionForWin(row, col, player, this.grid, false)
      if (won) {
        this.winner = player
      }
      this.togglePlayer()
      this.canAcceptInput = true
    } else {
      this.drawSpecificBlock(
        (clickCol * this.cellSize),
        (clickRow * this.cellSize) + this.dropAnimationY,
        this.colorFromPlayer(player)
      )
      this.dropAnimationY += d3.easePolyIn(1.2)
    }
    
  }

  drawSpecificBlock(x: number, y: number, color: string) {
    this.context.fillStyle = color
    this.context.fillRect(x + 1, y + 1, this.cellSize - 1, this.cellSize - 1)
  }
  
  drawBlock(row: number, col: number, color: string) {
    this.context.fillStyle = color
    this.context.fillRect((col * this.cellSize) + 1, (row * this.cellSize) + 1, this.cellSize - 1, this.cellSize - 1)
  }

  clearBlock(row: number, col: number) {
    this.context.clearRect((col * this.cellSize) + 1, (row * this.cellSize) + 1, this.cellSize - 1, this.cellSize - 1)
  }

  clearDebug() {
    setTimeout(() => {
      for (let row = 0; row < this.cellsY; row++) {
        for (let col = 0; col < this.cellsY; col++) {
          if (this.grid[row][col] == "X") {
            this.grid[row][col] = null
          }
        }
      }
    }, 1200)
  }

  drawBlocks() {
    for (let row = 0; row < this.cellsY; row++) {
      for (let col = 0; col < this.cellsX; col++) {
        if (this.grid[row][col] == "A") {
          this.drawBlock(row, col, 'red')
        } else if (this.grid[row][col] == "B") {
          this.drawBlock(row, col, 'blue')
        } else if (this.grid[row][col] == "X") {
          this.drawBlock(row, col, 'green')
        } else {
          this.drawBlock(row, col, 'white')
        }
      }
    }
  }

  drawGrid() {
    this.context.strokeStyle = '#333333'
    for (let col = 0; col <= this.width; col += this.cellSize) {
      this.context.beginPath();
      this.context.moveTo(col, 0);
      this.context.lineTo(col, this.height);
      this.context.stroke();
    }

    for (let row = 0; row <= this.height; row += this.cellSize) {
      this.context.beginPath();
      this.context.moveTo(0, row);
      this.context.lineTo(this.width, row);
      this.context.stroke();
    }
  }

  togglePlayer() {
    if (this.currentPlayer == "A") {
      this.currentPlayer = "B"
    } else {
      this.currentPlayer = "A"
    }
  }
  
  dropPiece(clickCol: number): {row: number, col: number} {
    for (let row = this.cellsY - 1; row >= 0; row--) {
      const cell = this.grid[row][clickCol]
      if (!cell) {
        return {row, col: clickCol}
      }
    }
  }
}

const game = new Game()
game.startGame()

btn.addEventListener('click', (e) => {
  game.startGame()
})
