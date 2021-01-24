import Game from "./Game";
import Layout from "./Layout";

const layout = new Layout();
const game = new Game();
layout.addEventListeners(game);
game.startGame();
