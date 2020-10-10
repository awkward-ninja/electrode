import '@/node_modules/normalize.css/normalize.css'
import './index.css'
import './theme.css'

function $(tag: string, parent: HTMLElement): HTMLElement {
  return parent.appendChild(document.createElement(tag))
}

window.addEventListener('DOMContentLoaded', () => {
  const { body } = document
  body.style.gridTemplateColumns = '255px 2px 1fr'

  const aside = $('aside', body)
  aside.style.gridTemplateRows = '127px 2px 1fr'

  const bdiv = $('div', body)

  const main = $('main', body)
  main.style.gridTemplateRows = '24px 24px 1fr'

  const anav1 = $('nav', aside)
  const adiv = $('div', aside)
  const anav2 = $('nav', aside)

  $('nav', main)
  $('nav', main)
  $('article', main)

  const drag: {
    target: HTMLElement | null,
    cursor: string | null,
    start: number
  } = {
    target: null,
    cursor: null,
    start: 0
  }

  bdiv.addEventListener('mousedown', () => {
    // assume divider always has a parent
    const parent: HTMLElement = <HTMLElement>bdiv.parentElement

    drag.target = bdiv
    drag.cursor = window.getComputedStyle(bdiv).cursor
    drag.start = parseInt(parent.style.gridTemplateColumns.split(' ')[0])
  })

  adiv.addEventListener('mousedown', () => {
    // assume divider always has a parent
    const parent: HTMLElement = <HTMLElement>adiv.parentElement

    drag.target = adiv
    drag.cursor = window.getComputedStyle(adiv).cursor
    drag.start = parseInt(parent.style.gridTemplateRows.split(' ')[0])
  })

  body.addEventListener('mouseup', () => {
    drag.target = null
  })

  body.addEventListener('mousemove', (event) => {
    if (drag.target === null) {
      return
    }

    // assume divider always has a parent
    const parent: HTMLElement = <HTMLElement>drag.target.parentElement

    if (drag.cursor === 'col-resize') {
      drag.start += event.movementX
      parent.style.gridTemplateColumns = `${drag.start}px 2px 1fr`
    } else {
      drag.start += event.movementY
      parent.style.gridTemplateRows = `${drag.start}px 2px 1fr`
    }
  })

  const header1 = $('header', anav1)
  header1.style.gridTemplateColumns = '1fr auto'

  const heading1 = $('h2', header1)
  heading1.textContent = 'sources'

  const button1 = $('button', header1)
  button1.textContent = '+'

  const header2 = $('header', anav2)
  header2.style.gridTemplateColumns = '1fr auto'

  const heading2 = $('h2', header2)
  heading2.textContent = 'schemas'
})