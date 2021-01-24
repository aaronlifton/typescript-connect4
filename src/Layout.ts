import Game from "./Game";

export default class Layout {
  canvas: HTMLCanvasElement;
  container: HTMLDivElement;
  startOverBtn: HTMLButtonElement;
  debugBtn: HTMLButtonElement;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "canvas";

    const gameContainer = document.createElement('div')
    gameContainer.id = 'game-container'
    this.container = document.createElement("div");
    this.container.id = "game";

    this.debugBtn = document.createElement("button");
    this.debugBtn.id = "debugBtn";
    this.debugBtn.innerHTML = "Toggle Debug";
    this.debugBtn.classList.add("btn");

    const btnContainer = document.createElement("div");
    btnContainer.id = "btnContainer"
    this.startOverBtn = document.createElement("button");
    this.startOverBtn.id = "startOverBtn";
    this.startOverBtn.classList.add("btn");
    this.startOverBtn.innerHTML = "Start Over";

    gameContainer.appendChild(this.container)
    btnContainer.appendChild(this.startOverBtn);
    btnContainer.appendChild(this.debugBtn);
    this.container.appendChild(this.canvas);
    this.container.appendChild(btnContainer);
    document.body.appendChild(gameContainer);
  }

  toggleDebug(game: Game) {
    game.toggleDebug();
    this.debugBtn.classList.toggle("disabled");
  }

  addEventListeners(game: Game) {
    this.startOverBtn.addEventListener("click", () => game.startGame());
    this.debugBtn.addEventListener("click", () => this.toggleDebug(game));
  }
}
