class Cat {
  speak() {
    return 'meow'
  }
}

const el = document.createElement('div')
el.innerHTML  = new Cat().speak()
document.body.appendChild(el)