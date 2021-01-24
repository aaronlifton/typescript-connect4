import { Cell, Player } from "./types";
import { checkPositionForWin } from "./winChecks";
import * as d3 from "d3-ease";
import "./style.css";

export default class Game {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private gridSize;
  private cellSize = 60;
  private scale = 1.5;
  private gridColor = "#333333";
  private width;
  private height;
  private grid: Cell[][];
  private debugGrid: boolean[][];
  private highlighted: boolean[][];
  private winner: Player;
  private currentPlayer: Player = "A";
  private isRunning = false;
  private lastTime: number;
  private fpsInterval = 20;
  private animatingDrop = false;
  private dropAnimationY = 0;
  private lastDrop: {
    clickCol: number;
    clickRow: number;
    row: number;
    col: number;
    player: Player;
  };
  private canAcceptInput = true;
  private debug = false;
  private sound: HTMLAudioElement;

  constructor(gridSize = 8) {
    this.gridSize = gridSize;
    this.width = this.gridSize * this.cellSize;
    this.height = this.gridSize * this.cellSize;

    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d");
    this.setupDimensions();
    this.lastTime = window.performance.now();

    this.setupAudio();
  }

  setupDimensions() {
    if (this.gridSize * this.cellSize * this.scale + 1 > window.innerHeight) {
      const height =
        window.innerHeight -
        document.getElementById("btnContainer").getBoundingClientRect().height;
      this.cellSize = height / (this.scale * this.gridSize) - 1;
      this.width = this.gridSize * this.cellSize;
      this.height = this.gridSize * this.cellSize;
    }
    this.canvas.width = this.gridSize * this.cellSize * this.scale + 1;
    this.canvas.height = this.canvas.width;
    this.context.scale(this.scale, this.scale);
    const container = this.canvas.parentElement as HTMLDivElement;
    container.style.width = `${this.canvas.width.toString()}px`;
    container.style.height = container.style.width;
  }

  setupGrid() {
    this.grid = [];
    this.highlighted = [];
    this.debugGrid = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.grid.push([]);
      this.highlighted.push([]);
      this.debugGrid.push([]);
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[this.grid.length - 1].push(null);
        this.highlighted[this.highlighted.length - 1].push(false);
        this.debugGrid[this.debugGrid.length - 1].push(false);
      }
    }
  }

  private getXYFromMouseEvent(e: MouseEvent) {
    return {
      x: e.offsetX / this.scale,
      y: e.offsetY / this.scale,
    };
  }

  private getXYFromTouchEvent(e: TouchEvent) {
    const touches = e.touches.length > 0 ? e.touches : e.changedTouches;
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (touches[0].pageX - rect.x) / this.scale,
      y: (touches[0].pageY - rect.y) / this.scale,
    };
  }

  private getRowColFromXY(x: number, y: number) {
    return {
      row: Math.floor(y / this.cellSize),
      col: Math.floor(x / this.cellSize),
    };
  }

  private outOfBounds(row: number, col: number) {
    return col >= this.gridSize || row >= this.gridSize;
  }

  private handleMouseMove<T extends MouseEvent | TouchEvent>(
    e: T,
    type: T extends MouseEvent ? "mouse" : "touch",
  ) {
    if (!this.canAcceptInput) return;

    const { x, y } =
      type == "mouse"
        ? this.getXYFromMouseEvent(e as MouseEvent)
        : this.getXYFromTouchEvent(e as TouchEvent);
    const { row, col } = this.getRowColFromXY(x, y);
    if (this.outOfBounds(row, col)) return;

    this.clearHighlights();
    this.highlighted[row][col] = true;
  }

  private handleClick<T extends MouseEvent | TouchEvent>(
    e: T,
    type: T extends MouseEvent ? "mouse" : "touch",
  ) {
    if (!this.canAcceptInput) return;

    const { x, y } =
      type == "mouse"
        ? this.getXYFromMouseEvent(e as MouseEvent)
        : this.getXYFromTouchEvent(e as TouchEvent);
    const { row, col } = this.getRowColFromXY(x, y);
    if (this.outOfBounds(row, col)) return;

    this.clearHighlights();
    this.handleBoxClick(row, col);
  }

  private registerHandlers() {
    this.canvas.onmousemove = (e) =>
      this.handleMouseMove<MouseEvent>(e, "mouse");
    this.canvas.ontouchstart = (e) =>
      this.handleMouseMove<TouchEvent>(e, "touch");
    this.canvas.ontouchmove = (e) =>
      this.handleMouseMove<TouchEvent>(e, "touch");
    this.canvas.onclick = (e) => this.handleClick<MouseEvent>(e, "mouse");
    this.canvas.ontouchend = (e) => this.handleClick<TouchEvent>(e, "touch");
    if (window.DeviceOrientationEvent) {
      console.log("Can handle DeviceOrientationEvent");
      window.addEventListener("deviceorientation", this.setupDimensions, false);
    }
  }

  private handleBoxClick(row: number, col: number) {
    const player = this.currentPlayer;
    const { row: placedRow, col: placedCol } = this.dropPiece(col);
    if (typeof placedRow == "undefined" || typeof placedCol == "undefined")
      return;

    this.lastDrop = {
      clickRow: row,
      clickCol: col,
      row: placedRow,
      col: placedCol,
      player,
    };
    this.sound.pause();
    this.restartSound();
    this.triggerAnimateDrop();
  }

  private iterateOverCells(fn: (row: number, col: number) => void) {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        fn(row, col);
      }
    }
  }

  clearHighlights() {
    this.iterateOverCells((row, col) => (this.highlighted[row][col] = false));
  }

  drawHighlight() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (!!this.grid[row][col]) continue;

        if (this.highlighted[row][col] == true) {
          const color = this.colorFromPlayer(this.currentPlayer).toLowerCase();
          this.drawBlock(row, col, color);
        } else {
          this.clearBlock(row, col);
        }
      }
    }
  }

  private colorFromPlayer(player: Player) {
    return player == "A" ? "Red" : "Blue";
  }

  startGame() {
    this.setupGrid();
    this.registerHandlers();
    this.winner = null;
    this.lastDrop = null;
    this.animatingDrop = false;
    this.canAcceptInput = true;
    this.isRunning = true;
    this.runGameLoop();
  }

  runGameLoop(newTime?: number) {
    if (!this.isRunning) {
      this.handleWin();
      return;
    }

    window.requestAnimationFrame(this.runGameLoop.bind(this));

    const now = newTime;
    const timeElapsed = now - this.lastTime;

    if (timeElapsed > this.fpsInterval) {
      this.lastTime = now - (timeElapsed % this.fpsInterval);

      this.drawGrid();
      this.drawBlocks();
      this.drawHighlight();
      this.animateDrop();

      if (this.winner && !this.animatingDrop) {
        this.isRunning = false;
      }
    }
  }

  handleWin() {
    this.canAcceptInput = false;
    const winnerColor = this.colorFromPlayer(this.winner);

    this.context.font = "24px sans-serif";
    this.context.fillStyle = this.gridColor;

    const text = `${winnerColor} won!`;
    const textMetrics = this.context.measureText(text);
    this.context.fillText(
      text,
      this.width / 2 - textMetrics.width / 2,
      this.height / 2 - textMetrics.actualBoundingBoxAscent / 2,
      this.width,
    );
  }

  triggerAnimateDrop() {
    this.canAcceptInput = false;
    this.animatingDrop = true;
  }

  animateDrop() {
    if (!this.lastDrop || !this.animatingDrop) return;

    window.requestAnimationFrame(this.animateDrop.bind(this));

    const { clickRow, clickCol, row, col, player } = this.lastDrop;
    const dropFinished =
      clickRow * this.cellSize + this.dropAnimationY >= this.cellSize * row;

    if (dropFinished) {
      this.grid[row][col] = player;
      this.playSound();
      const won = checkPositionForWin(
        row,
        col,
        player,
        this.grid,
        this.gridSize,
        this.debugGrid,
        this.debug,
      );
      this.animatingDrop = false;
      this.dropAnimationY = 0;

      if (this.debug) this.setClearDebugTimeout();
      if (won) {
        if (this.debug) this.clearDebugGrid();
        this.winner = player;
      } else {
        this.togglePlayer();
        this.canAcceptInput = true;
      }
      this.runGameLoop();
    } else {
      this.drawBlockAtPoint(
        clickCol * this.cellSize,
        clickRow * this.cellSize + this.dropAnimationY,
        this.colorFromPlayer(player),
      );
      this.dropAnimationY += d3.easePolyIn(1.2);
    }
  }

  drawBlockAtPoint(x: number, y: number, color: string) {
    this.context.fillStyle = color;
    this.context.fillRect(
      x + 1.0 / this.scale,
      y + 1.0 / this.scale,
      this.cellSize - 1,
      this.cellSize - 1,
    );
  }

  drawBlock(row: number, col: number, color: string) {
    this.context.fillStyle = color;
    this.context.fillRect(
      col * this.cellSize + 1.0 / this.scale,
      row * this.cellSize + 1.0 / this.scale,
      this.cellSize - 1,
      this.cellSize - 1,
    );
  }

  clearBlock(row: number, col: number) {
    this.context.clearRect(
      col * this.cellSize + 1.0 / this.scale,
      row * this.cellSize + 1.0 / this.scale,
      this.cellSize - 1,
      this.cellSize - 1,
    );
  }

  setClearDebugTimeout() {
    setTimeout(() => {
      this.clearDebugGrid();
    }, 1000);
  }

  clearDebugGrid() {
    this.iterateOverCells((row, col) => (this.debugGrid[row][col] = false));
  }

  drawBlocks() {
    this.iterateOverCells((row, col) => {
      if (this.debugGrid[row][col]) {
        this.drawBlock(row, col, "green");
      } else if (this.grid[row][col] == "A") {
        this.drawBlock(row, col, "red");
      } else if (this.grid[row][col] == "B") {
        this.drawBlock(row, col, "blue");
      } else {
        this.drawBlock(row, col, "white");
      }
    });
  }

  drawGrid() {
    this.context.strokeStyle = this.gridColor;
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
      this.currentPlayer = "B";
    } else {
      this.currentPlayer = "A";
    }
  }

  dropPiece(clickCol: number): { row: number; col: number } {
    for (let row = this.gridSize - 1; row >= 0; row--) {
      const cell = this.grid[row][clickCol];
      if (!cell) {
        return { row, col: clickCol };
      }
    }
  }

  toggleDebug() {
    this.debug = !this.debug;
  }

  private setupAudio() {
    this.sound = document.createElement("audio");
    this.sound.src = "assets/ping.mp3";
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
  }

  private restartSound() {
    this.sound.currentTime = 0;
  }

  private playSound() {
    if (this.sound.paused) {
      this.sound.play();
    } else {
      this.restartSound();
    }
  }
}
