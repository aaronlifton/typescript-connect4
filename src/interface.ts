import { Game } from './types'

const el = document.createElement('canvas')
el.id  = 'canvas'

const container = document.createElement('div')
container.id = 'game'

const debugBtn = document.createElement('button')
debugBtn.id  = 'debugBtn'
debugBtn.innerHTML = 'Toggle Debug'
debugBtn.classList.add('btn')

const div = document.createElement('div')
const btn = document.createElement('button')
btn.id  = 'startOverBtn'
btn.classList.add('btn')
btn.innerHTML = 'Start Over'

const toggleDebug = (game: Game) => {
  game.debug = !game.debug
  debugBtn.classList.toggle('disabled')
}

export const setup = {
  addEventListeners: (game: Game) => {
    btn.addEventListener('click', () => game.startGame())
    debugBtn.addEventListener('click', () => toggleDebug(game))
  },
  setupInterface: () => {
    container.appendChild(el)
    document.body.appendChild(container)

    div.appendChild(btn)  
    div.appendChild(debugBtn)
    document.body.appendChild(div)
  }
}