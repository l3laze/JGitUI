'use strict'

import { languages } from './lexer-keywords.mjs'

const et = `Science! ${1 + 1} != ${2 + 2}`

/*
 * StandardJS or ESLint or VSCode doesn't
 *   know the v flag yet. Usage causes
 *   linter to throw invalid regex error.
 */
const er1 = /(?<brain>brain(?!(?:fart)))/sugmydi.test('brainfart')
const er2 = /(?<brain>brain(?!(?:fart)))/sugmydi.test('brainwave')

console.log(et)
console.log(er1)
console.log(er2)

function lexer (text, keywordLanguages = ['html', 'css', 'js']) {
  let offset = 0
  let next1 = text[0]
  let ch = 1
  let prev1
  let prev2
  let lastTokenType
  let lexical = {}
  let token = {
    value: '',
    type: 'unknown',
    multi: false,
    endOf: () => true
  }

  const keywords = keywordLanguages
    .reduce((acc, lang) => {
      const list = languages[lang]().split(', ')

      if (list[0] !== '') {
        return acc.concat(list)
      }

      return acc
    }, [])

  const tokens = []

  const lexicalType = [
    {
      identify: () => /\w/.test(ch),
      type: 'word',
      endOf: () => /\W/.test(ch)
    },
    {
      identify: () => /[[\]]/.test(ch),
      type: 'square',
      endOf: () => true
    },
    {
      identify: () => /[{}]/.test(ch),
      type: 'curly',
      endOf: () => true
    },
    {
      identify: () => /[()]/.test(ch),
      type: 'parentheses',
      endOf: () => true
    },
    {
      identify: () => /[;,.]/.test(ch),
      type: 'separator',
      endOf: () => true
    },
    {
      identify: () => ch === '"' && !['`', "'", '\\'].includes(prev1),
      type: 'string',
      endOf: () => token.value.length > 1 && prev1 === '"'
    },
    {
      identify: () => ch === "'" && !['`', '"', '\\'].includes(prev1),
      type: 'string',
      endOf: () => token.value.length > 1 && prev1 === "'"
    },
    {
      identify: () => ch === '`' && !["'", '"', '\\'].includes(prev1),
      type: 'string',
      endOf: () => (prev1 === '`' && token.value.length > 1)
    },
    {
      identify: () => (ch === '/' && next1 === '/' && prev1 !== '\\'),
      type: 'comment',
      endOf: () => ch === '\n'
    },
    {
      identify: () => (ch === '/' && next1 === '*' && prev1 !== '\\'),
      type: 'comment',
      endOf: () => {
        /*
         * Stupid workaround for single-token
         * multi-line comment causing formatting
         * issues. Makes them one token per line.
         */
        const ending = (text[offset - 2] === '*' && prev1 === '/')

        if (prev1 === '\n') {
          token.value = token.value.substring(0, token.value.length - 1)

          tokens.push(token)

          tokens.push({
            value: '\n',
            type: 'newline'
          })

          const tEnd = token.endOf

          token = {
            value: '',
            type: 'comment',
            endOf: tEnd
          }
        }

        return ending
      }
    },
    {
      identify: () => (ch === '/' && prev1 !== '\\'),
      type: 'regex',
      endOf: () => /[.}\])]/.test(ch) && /[\s\w]/.test(next1)
    },
    {
      identify: () => /[!@#$$%^&*+=<>?/\\|:-]/.test(ch),
      type: 'operator',
      endOf: () => true
    },
    {
      identify: () => ch === '\n',
      type: 'newline',
      endOf: () => true
    },
    {
      identify: () => /[\s]/.test(ch),
      type: 'whitespace',
      endOf: () => /[\S]/.test(ch)
    },
    {
      identify: () => /\S/.test(ch),
      type: 'unknown',
      endOf: () => true
    }
  ]

  text += '\n'

  for (offset = 0; offset < text.length; offset++) {
    prev2 = prev1 ?? prev2
    prev1 = ch ?? prev1
    ch = next1
    next1 = text[offset + 1]

    lexical = lexicalType.find((t) => t.identify(ch))

    const isEnd = token.endOf()

    if (isEnd) {
      if (token.type === 'word') {
        if (keywords.includes(token.value)) {
          if (tokens[tokens.length - 1].value === '.') {
            token.type = 'method'
          } else {
            token.type = 'keyword'
          }
        }
      }

      tokens.push(token)

      lastTokenType = [
        'curly',
        'square',
        'parentheses',
        'word',
        'keyword',
        'method',
        'regex',
        'string'
      ].includes(token.type)
        ? lastTokenType
        : token.type

      token = {
        value: ch,
        type: lexical.type,
        endOf: lexical.endOf
      }
    } else {
      token.value += ch
    }
  }

  tokens.push(token)

  return tokens
}

export default lexer

export {
  lexer
}
