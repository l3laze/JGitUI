'use strict'

import { lexer } from './lexer.mjs'

class Highlighter {
  constructor () {
    this.lexer = lexer
  }

  highlight = (element) => {
    const text = element.textContent.replaceAll('\r\n', '\n')
    const tokens = this.lexer(text)

    const zeroWidthSpace = '​' // &ZeroWidthSpace;

    let newLine
    let codeLine = document.createElement('code')
    let codeSpan

    codeLine.classList.add('has-spaces')

    for (const c of element.childNodes) {
      element.removeChild(c)
    }

    for (const t of tokens) {
      if (t.value === '') {
        continue
      } else if (t.value !== '\n') {
        codeSpan = document.createElement('span')

        codeSpan.classList.add(`token-${t.type}`)

        ;['word', 'keyword', 'native', 'comment', 'string', 'regex'].includes(t.type)
          ? codeSpan.appendChild(document.createTextNode(t.value.replace(/([\s_.,;:&|\])>}+-])/g, `$1${zeroWidthSpace}`)))
          : codeSpan.appendChild(document.createTextNode(t.value + zeroWidthSpace))

        codeLine.appendChild(codeSpan)
      } else {
        const spaces = /(?<spaces>[ ]*)/.exec(codeLine.textContent)

        codeLine.classList.add('has-spaces')

        codeLine.setAttribute('data-spaces', spaces.groups.spaces.length)

        newLine = document.createElement('span')

        newLine.classList.add('token-newline')

        newLine.appendChild(document.createTextNode('\n'))

        codeLine.appendChild(newLine)
        element.appendChild(codeLine)

        codeLine = document.createElement('code')
      }
    }
  }
}

export default Highlighter

export {
  Highlighter
}
