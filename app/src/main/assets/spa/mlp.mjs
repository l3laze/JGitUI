'use strict'

class MLP {
  constructor () {
    this.tokens = []
    this.prevChar = ''
  }

  tokenData = (character) => [
    {
      test: (c) => /\s/.test(c),
      type: 'whitespace',
      multi: false,
      inclusive: false,
      endOf: (c) => /\S/.test(c)
    },
    {
      test: (c) => c === '\'' && this.prevChar !== '\\',
      type: 'string',
      multi: true,
      inclusive: true,
      endOf: (c) => c === '\'' && this.prevChar !== '\\'
    },
    {
      test: (c) => c === '`' && this.prevChar !== '\\',
      type: 'string',
      multi: true,
      inclusive: true,
      endOf: (c) => c === '`' && this.prevChar !== '\\'
    },
    {
      test: (c) => c === '"' && this.prevChar !== '\\',
      type: 'string',
      multi: true,
      inclusive: true,
      endOf: (c) => c === '"' && this.prevChar !== '\\'
    },
    {
      test: (c) => /\w/.test(c),
      type: 'word',
      multi: true,
      inclusive: false,
      endOf: (c) => !/\w/.test(c)
    },
    {
      test: (c) => /[!?*+\\/|&^%$$#@~.,=:;<>-]/.test(c),
      type: 'operator',
      multi: true,
      inclusive: false,
      endOf: (c) => !/[!?*+\\/|&^%$$#@~.,=:;<>-]/.test(c)
    },
    {
      test: (c) => /[{}[\]()]/.test(c),
      type: 'brace',
      multi: false,
      inclusive: false,
      endOf: (c) => !/[{}[]()]/.test(c)
    },
    {
      test: (c) => /\S/.test(c),
      type: 'non-whitespace',
      multi: true,
      inclusive: false,
      endOf: (c) => !/\S/.test(c)
    }
  ].find((typeTest) => typeTest.test(character))

  tokenize = (data) => {
    const text = data.split('')
    let token = ''
    let currData
    const defaultTokenData = {
      test: () => false,
      type: 'none',
      multi: false,
      inclusive: false,
      endOf: (c) => c !== ''
    }

    currData = defaultTokenData

    for (let offset = 0; offset < text.length; offset++) {
      if (currData.type === 'non-whitespace') {
        console.log(token, currData)
      }

      if (currData.type ===
          this.tokenData(text[offset]).type ||
            (currData.multi && !currData.endOf(text[offset]))) {
        token += text[offset]

        this.prevChar = text[offset - 1]
      }

      if (currData.endOf(text[offset])) {
        if (currData.type !== 'none') {
          this.tokens.push({
            value: token,
            type: currData.type
          })
        }

        if (currData.inclusive) {
          token = ''

          currData = defaultTokenData
        } else {
          token = text[offset]

          currData = this.tokenData(token)
        }
      }
    }
  }
}

export default MLP

export {
  MLP
}
