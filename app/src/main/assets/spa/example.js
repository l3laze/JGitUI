import { Highlighter } from './highlighter.mjs'

const container = document.querySelector('#code-container')
const codeContainer = container.querySelector('code')
const numbers = document.querySelector('#line-numbers')
const editor = document.querySelector('#code-editor')

// let editTimer = 0
// let maxLeft = 0

// const maxScrollLeft = () => container.scrollWidth - container.clientWidth

async function loadCode (code) {
  if ((typeof code !== 'object' || code.constructor.name !== 'Array') || code.length === 0) {
    code = '\n'
  }

  for (let line = 0; line < code.length; line++) {
    const lineNo = document.createElement('span')

    lineNo.classList.add('line-number')

    lineNo.appendChild(document.createTextNode(line + 1))
    lineNo.appendChild(document.createElement('br'))

    numbers.appendChild(lineNo)
  }

  codeContainer.textContent = code.join('\n')
  editor.textContent = code.join('\n')

  const highlighter = new Highlighter()

  highlighter.highlight(container)
}

async function fetchCode (url) {
  const request = await fetch(url)
  const response = await request.text()

  const source = response
    .replaceAll('\r', '')

  const injectedStarts = source.indexOf('<' + '!-- Code injected')
  const injectedEnds = source.indexOf('<' + '/script>', injectedStarts + 1)

  const beforeInjected = source.slice(0, injectedStarts)
  const afterInjected = source.slice(injectedEnds + 10)

  loadCode((beforeInjected + afterInjected).split('\n'))
}

function init () {
  editor.addEventListener('input', () => {
  })

  editor.addEventListener('scroll', () => {
    codeContainer.scrollTop = editor.scrollTop
    codeContainer.scrollLeft = editor.scrollLeft

    numbers.scrollTop = editor.scrollTop
  })

  numbers.addEventListener('scroll', () => {
    codeContainer.scrollTop = numbers.scrollTop

    editor.scrollTop = numbers.scrollTop
  })

  numbers.addEventListener('click', (event) => {
    editor.focus()

    const line = event.target.textContent
    const text = editor.textContent.split('\n')
    // const lineText = text[line - 1]

    if (line < text.length + 1) {
      // Idea based on https://dev.to/phuocng/highlight-the-current-line-in-a-text-area-36aj
      const beforeCaret = text.slice(0, line - 1 > 0 ? line - 1 : 0)
        .join('\n')

      const afterCaret = text.slice(line - 1 > 0 ? line - 1 : 0)
        .join('\n')

      let caretTo = beforeCaret.length

      if (line !== '1') {
        caretTo++
      }

      editor.selectionStart = caretTo
      editor.selectionEnd = caretTo + afterCaret.indexOf('\n')
    }
  })
}

window.addEventListener('load', async () => {
  // container.textContent = document.documentElement.outerHTML

  init()

  fetchCode('./example.js')

  // maxLeft = maxScrollLeft()
})
