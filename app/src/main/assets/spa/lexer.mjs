'use strict'

import { languages } from './lexer-keywords.mjs'

const et = `Science! ${1 + 1} != ${2 + 2}`

/* eslint-disable-next-line no-useless-escape */
const regesc = /\E\S\C/

/* eslint-disable-next-line no-useless-escape */
const esc = '\E\S\Caped'

/*
 * StandardJS or ESLint or VSCode does not
 *   know the v flag yet. Usage causes
 *   linter to throw invalid regex error.
 */
const er1 = /(?<brain>brain(?!(?:fart)))/sugmydi.test('brainfart')
const er2 = /(?<brain>brain(?!(?:fart)))/sugmydi.test('brainwave')

console.log(et)
console.log(er1)
console.log(er2)
console.log(regesc.test(esc))

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
      identify: () => ch === '"' && !['`', '\'', '\\'].includes(prev1),
      type: 'string',
      endOf: () => prev1 === '"' && (token.value.length > 1 || token.continued)
    },
    {
      identify: () => ch === "'" && !['`', '"', '\\'].includes(prev1),
      type: 'string',
      endOf: () => prev1 === '\'' && (token.value.length > 1 || token.continued)
    },
    {
      identify: () => ch === '`' && !['\'', '"', '\\'].includes(prev1),
      type: 'string',
      endOf: () => prev1 === '`' && (token.value.length > 1 || token.continued)
    },
    {
      identify: () => (ch === '/' && next1 === '/' && prev1 !== '\\'),
      type: 'comment',
      endOf: () => ch === '\n'
    },
    {
      identify: () => (ch === '/' && next1 === '*' && prev1 !== '\\'),
      type: 'comment',
      endOf: () => (text[offset - 2] === '*' && prev1 === '/')
    },
    {
      identify: () => (ch === '/' && prev1 !== '\\'),
      type: 'regex',
      endOf: () => (/[.}\])/]/.test(ch) && /[\s\w]/.test(next1)) || prev1 === '\n'
    },
    {
      identify: () => (ch === '$' && next1 === '{'),
      type: 'template',
      endOf: () => prev1 === '}',
      nested: true
    },
    {
      identify: () => (ch === '\\' && prev1 !== '\\'),
      type: 'escaped',
      endOf: () => token.value.length > 1,
      nested: true
    },
    {
      identify: () => /[!@#$$%^&*+=<>?/|:-]/.test(ch),
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
            token.type = 'native'
          } else {
            token.type = 'keyword'
          }
        }
      }

      tokens.push(token)

      if (!token.parent) {
        lastTokenType = [
          'curly',
          'square',
          'parentheses',
          'word',
          'native',
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
        // Repeated nested tokens
        if (lexical.nested) {
          token = {
            value: ch,
            type: lexical.type,
            endOf: lexical.endOf,
            parent: token.parent,
            continued: true
          }
        } else {
          // Ending nested token
          token = {
            value: ch,
            type: token.parent.type,
            endOf: token.parent.endOf,
            parent: token.parent.parent,
            continued: true
          }
        }
      }
    } else if (ch === '\n') {
      tokens.push(token)

      tokens.push({
        value: '\n',
        type: 'newline'
      })

      token = {
        value: '',
        type: token.type,
        endOf: token.endOf
      }
    } else if (lexical.nested) {
      tokens.push(token)

      token = {
        parent: token,
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
