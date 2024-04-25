'use strict'

/* global testOne */

function loadStyle (files) {
  const existing = Array.from(document.head.querySelectorAll('link [rel=stylesheet]'))
    .map((l) => l.href)

  for (let i = 0; i < files.length; i++) {
    if (existing.includes(files[i])) {
      continue
    }

    const linkEl = document.createElement('link')

    linkEl.rel = 'stylesheet'
    linkEl.type = 'text/css'
    linkEl.href = files[i]

    document.querySelectorAll('link')[0].appendChild(linkEl)

    existing.push(files[i])
  }
}

async function loadScript (files, after) {
  const existing = Array.from(document.querySelectorAll('#script-container > script'))
    .map((s) => s.src)

  for (let i = 0; i < files.length; i++) {
    if (existing.includes(files[i])) {
      continue
    }

    const script = document.createElement('script')

    document.getElementById('script-container').append(script)

    if (typeof after !== 'undefined') {
      script.addEventListener('load', () => {
        after()
      })
    }

    script.type = 'text/javascript'
    script.async = false
    script.src = files[i]

    existing.push(files[i])
  }
}

async function fetchContent (url, element, after) {
  try {
    const response = await fetch(url)

    element.innerHTML = await response.text()

    const styleElements = element.querySelectorAll('link')

    const styleFiles = Array.from(styleElements).map((e) => e.href)

    loadStyle(styleFiles)

    for (const e of styleElements) {
      e.parentElement.removeChild(e)
    }

    const scriptElements = element.querySelectorAll('script')

    const scriptFiles = Array.from(scriptElements)
      .map((e) => e.src)
      .filter((e) => e.indexOf('vscode') === -1)

    for (const e of scriptElements) {
      e.parentElement.removeChild(e)
    }

    loadScript(scriptFiles, after)
  } catch (err) {
    console.error(err)

    throw err
  }
}

function verifyOptions (o, possibleOptions = {}) {
  const keys = Object.keys(o)
  const pkeys = Object.keys(possibleOptions)

  for (const k of keys) {
    if (pkeys.indexOf(k) === -1) {
      throw new Error(`Unknown fetch option: ${k}`)
    }

    /* eslint-disable-next-line valid-typeof */
    if ((possibleOptions[k].type !== 'list' && typeof o[k] !== possibleOptions[k].type) ||
        (possibleOptions[k].type === 'list' && o[k].constructor.name !== 'Array')) {
      throw new Error(`Invalid value for fetch option "${k}": ${JSON.stringify(o[k], null, 2)}`)
    }

    if (typeof possibleOptions[k].range !== 'undefined' &&
      (o[k] <= possibleOptions[k].range.minimum || o[k] >= possibleOptions[k].range.maximum)) {
      throw new Error(`Value out of range for fetch option ${k}. Should be within ` +
        `${possibleOptions[k].range.minimum} to ${possibleOptions[k].range.maximum} (inclusive),` +
        `but is ${o[k]}.`)
    }

    if (typeof possibleOptions[k].list !== 'undefined' && possibleOptions[k].list.indexOf(o[k]) === -1) {
      throw new Error(`Invalid option for ${k}. Should be one of ` +
        `${possibleOptions[k].list.join(', ')}, but is ${o[k]}.`)
    }

    if (possibleOptions[k].type === 'map' && typeof possibleOptions[k].test !== 'undefined') {
      if (!possibleOptions[k].test(o[k])) {
        throw new Error(`Option ${k} value ${o[k]} did not pass internal value test.`)
      }
    }

    if (typeof possibleOptions[k].test !== 'undefined') {
      if (!possibleOptions[k].test(o[k])) {
        throw new Error(`Option ${k} value ${o[k]} did not pass internal value test.`)
      }
    }
  }
}

function showAndHideSiblings (selector, displayAs, siblingsAt) {
  const el = document.querySelector(`${siblingsAt} > ${selector}`)

  el.style.display = displayAs

  const siblings = (typeof siblingsAt === 'undefined')
    ? el.parentElement.querySelectorAll(`:not(${selector})`)
    : document.querySelectorAll(`${siblingsAt} > :not(${selector})`)

  Array.from(siblings).forEach((s) => {
    s.style.display = 'none'
  })
}

async function loadContent (event, options) {
  const validOptions = {
    url: {
      type: 'string',
      test: (s) => {
        try {
          const baseURL = window.location.href.slice(0, window.location.href.lastIndexOf('/'))

          return Boolean(new URL(s, baseURL))
        } catch (err) {
          return false
        }
      }
    },
    container: {
      type: 'string'
    },
    element: {
      type: 'string'
    },
    self: {
      type: 'string'
    },
    displayAs: {
      type: 'string'
    },
    after: {
      type: 'function'
    }
  }

  verifyOptions(options, validOptions)

  if (document.querySelector(options.self) === null) {
    await fetchContent(options.url, document.querySelector(options.element), options.after)
  }

  showAndHideSiblings(options.element, options.displayAs, options.container)

  const backBtn = document.getElementById('spa-back')
  const history = backBtn.getAttribute('data-history')

  const historyData = history === null
    ? []
    : JSON.parse(history)

  const container = document.getElementById('spa-container')
  const currentSelector = container.getAttribute('data-current-element')

  const prev = historyData === null
    ? []
    : historyData.slice(-1)[0]

  if (currentSelector !== null && JSON.stringify(prev) !== JSON.stringify(currentSelector)) {
    historyData.push(currentSelector)
  }

  if (historyData.length > 0) {
    backBtn.setAttribute('data-history', JSON.stringify(historyData))
  }

  container.setAttribute('data-current-element', JSON.stringify({
    element: options.element,
    displayAs: options.displayAs,
    container: options.container
  }))
}

document.getElementById('spa-fetch').addEventListener('click', async (event) => {
  const options = {
    url: './spa-test/one.html',
    container: '#spa-container',
    element: 'div.tab:nth-of-type(1)',
    self: '#spa-test-one',
    displayAs: 'block',
    after: () => {
      testOne()
    }
  }

  await loadContent(event, options)
})

document.getElementById('spa-back').addEventListener('click', (event) => {
  const backBtn = event.target
  const history = backBtn.getAttribute('data-history')
  const container = document.getElementById('spa-container')

  const historyData = history === null
    ? []
    : JSON.parse(history)

  if (historyData.length > 0) {
    const prev = JSON.parse(historyData.slice(-1)[0])

    showAndHideSiblings(prev.element.toString(),
      prev.displayAs.toString(),
      prev.container.toString())

    container.setAttribute('data-current-element', JSON.stringify(prev))

    if (historyData.length - 1 > 0) {
      backBtn.setAttribute('data-history', JSON.stringify(historyData.slice(0, -1)))
    } else {
      backBtn.removeAttribute('data-history')
    }
  }
})
