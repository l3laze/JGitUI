'use strict'

/* global testOne */

function loadStyle (files, elements) {
  for (let i = 0; i < files.length; i++) {
    const fileref = document.createElement('link')

    fileref.rel = 'stylesheet'
    fileref.type = 'text/css'
    fileref.href = files[i]

    elements[i].parentElement.removeChild(elements[i])

    document.querySelectorAll('link')[0].appendChild(fileref)
  }
}

function loadScript (files, elements) {
  for (let i = 0; i < files.length; i++) {
    const script = document.createElement('script')

    document.body.append(script)

    script.type = 'text/javascript'
    script.async = true
    script.src = files[i]

    elements[i].parentElement.removeChild(elements[i])
  }
}

async function sleep (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

async function fetchContent (url, element, after) {
  try {
    const response = await fetch(url)

    element.innerHTML = await response.text()

    const styleElements = element.querySelectorAll('link')

    const scriptElements = element.querySelectorAll('script')

    loadStyle(Array.from(styleElements).map((e) => e.href), styleElements)
    loadScript(Array.from(scriptElements).map((e) => e.src).filter((e) => e.indexOf('vscode') === -1), scriptElements, after)

    // Needs a delay so JS can be loaded and define any globals, so after callbacks will work.
    await sleep(50)
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

  console.log('showAndHideSiblings: ', selector, displayAs, siblingsAt, `${siblingsAt} > ${selector}`)

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
    action: {
      type: 'string',
      list: ['click']
    },
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
    displayAs: {
      type: 'string'
    },
    globals: {
      type: 'list'
    },
    after: {
      type: 'function'
    }
  }

  verifyOptions(options, validOptions)

  if (!event.target.getAttribute('data-has-loaded')) {
    event.target.setAttribute('data-has-loaded', true)

    const selector = `${options.container} > ${options.element}`

    await fetchContent(options.url, document.querySelector(selector), options.after)
  }

  showAndHideSiblings(options.element, options.displayAs, options.container)

  if (typeof options.after === 'function') {
    options.after()
  }

  const backBtn = document.getElementById('spa-back')
  const history = backBtn.getAttribute('data-history')

  const historyData = history === null
    ? []
    : JSON.parse(history)

  const container = document.getElementById('spa-container')
  const currentSelector = container.getAttribute('data-current-element')

  const prev = historyData === null
    ? {}
    : historyData.slice(-1)[0]

  if (currentSelector !== null && JSON.stringify(prev) !== JSON.stringify(currentSelector)) {
    historyData.push(currentSelector)

    console.log(`stored current: ${currentSelector}`)
  }

  if (historyData.length > 0) {
    backBtn.setAttribute('data-history', JSON.stringify(historyData))
  }

  container.setAttribute('data-current-element', JSON.stringify({
    element: options.element,
    displayAs: options.displayAs,
    parentSelector: options.container
  }))

  // console.log(container.getAttribute('data-current-element'))
}

document.getElementById('spa-fetch').addEventListener('click', async (event) => {
  const options = {
    url: './spa-test/one.html',
    container: '#spa-container',
    element: 'div.tab:nth-of-type(1)',
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

    console.log(prev)

    showAndHideSiblings(prev.element.toString(), prev.displayAs.toString(), prev.parentSelector.toString())

    container.setAttribute('data-current-element', JSON.stringify(prev))

    console.log(`set current: ${container.getAttribute('data-current-element')}`)

    if (historyData.length - 1 > 0) {
      backBtn.setAttribute('data-history', JSON.stringify(historyData.slice(0, -1)))
    } else {
      backBtn.removeAttribute('data-history')
    }
  }
})
