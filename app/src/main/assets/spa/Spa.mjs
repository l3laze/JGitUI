'use strict'

import $ from './jQuery-like.mjs'

class Spa {
  #validOpts = {
    url: {
      type: 'string',
      test: (v) => {
        try {
          const baseURL = window.location.href.slice(0, window.location.href.lastIndexOf('/'))

          return Boolean(new URL(v, baseURL))
        } catch (err) {
          return false
        }
      }
    },
    container: {
      type: 'string'
    },
    parent: {
      type: 'string'
    },
    ownElement: {
      type: 'string'
    },
    displayAs: {
      type: 'string',
      choice: [
        'none',
        'block',
        'inline',
        'inline-block',
        'flex',
        'inline-flex'
      ]
    },
    title: {
      type: 'string'
    },
    after: {
      type: 'function'
    }
  }

  #backBtn = null

  history = []
  current = null

  constructor (bb) {
    this.#backBtn = bb
  }

  #verifyOptions = async (o) => {
    const keys = Object.keys(o)
    const pkeys = Object.keys(this.#validOpts)

    if (keys.length === 0) {
      throw new Error('No options provided.')
    }

    for (const k of keys) {
      if (pkeys.indexOf(k) === -1) {
        throw new Error(`Unknown option: ${k}`)
      }

      const otype = o[k].constructor.name === 'Array'
        ? 'array'
        : typeof o[k]

      const vtype = this.#validOpts[k].type

      /* eslint-disable-next-line valid-typeof */
      if (otype !== vtype) {
        throw new Error(`Invalid type for value of option "${k}": "${JSON.stringify(o[k])}"`)
      }

      // if (typeof this.#validOpts[k].range !== 'undefined' &&
      //   (o[k] < this.#validOpts[k].range.minimum || o[k] > this.#validOpts[k].range.maximum)) {
      //   throw new Error(`Value out of range for option ${k}. Should be within ` +
      //     `${this.#validOpts[k].range.minimum} to ${this.#validOpts[k].range.maximum} (inclusive), ` +
      //       `but is ${o[k]}.`)
      // }

      if (typeof this.#validOpts[k].choice !== 'undefined' && this.#validOpts[k].choice.includes(o[k]) === false) {
        throw new Error(`Invalid option for ${k}. Should be one of "${this.#validOpts[k].choice.join(', ')}", but is "${o[k]}".`)
      }

      if (typeof this.#validOpts[k].test !== 'undefined') {
        if (!this.#validOpts[k].test(o[k])) {
          throw new Error(`Option "${k}" value "${o[k]}" did not pass internal value test.`)
        }
      }
    }
  }

  #loadStyle = async (files) => {
    const existing = Array.from($.all('link [rel=stylesheet]'))
      .map((l) => l.href)

    for (let i = 0; i < files.length; i++) {
      if (existing.includes(files[i])) {
        continue
      }

      const linkEl = document.createElement('link')

      linkEl.addEventListener('load', (event) => {
        // console.log(`loaded ${event.target.href}`)
      })

      linkEl.rel = 'stylesheet'
      linkEl.type = 'text/css'
      linkEl.href = files[i]

      document.head.appendChild(linkEl)

      existing.push(files[i])
    }
  }

  #loadScript = async (files, after) => {
    const existing = Array.from($.all('#script-container > script'))
      .map((s) => s.src)

    for (let i = 0; i < files.length; i++) {
      if (existing.includes(files[i])) {
        continue
      }

      const script = document.createElement('script')

      $('#script-container').append(script)

      if (typeof after !== 'undefined') {
        script.addEventListener('load', () => {
          after()
        })
      }

      script.type = 'module'
      script.async = false
      script.src = files[i]

      existing.push(files[i])
    }
  }

  #fetchContent = async (url, parent, after) => {
    try {
      const response = await fetch(url)

      parent.innerHTML = await response.text()

      const styleElements = $.all('link', parent)

      const styleFiles = Array.from(styleElements).map((e) => e.href)

      await this.#loadStyle(styleFiles)

      for (const e of styleElements) {
        e.parentElement.removeChild(e)
      }

      const scriptElements = $.all('script', parent)

      const scriptFiles = Array.from(scriptElements)
        .map((e) => e.src)
        .filter((e) => e.indexOf('vscode') === -1)

      for (const e of scriptElements) {
        e.parentElement.removeChild(e)
      }

      await this.#loadScript(scriptFiles, after)
    } catch (err) {
      console.error(err)

      throw err
    }
  }

  showAndHideSiblings = async (options = {}) => {
    const { parent, displayAs, container } = options
    const el = $(`${container} > ${parent}`)

    el.style.display = displayAs

    const siblings = $.all(`${container} > :not(${parent})`)

    // console.log(Array.from(siblings).map((s) => `${s.tagName} = ${s.id}`))

    Array.from(siblings).forEach((s) => {
      s.style.display = 'none'
    })
  }

  loadContent = async (options) => {
    const navTitle = $('#nav-title')

    await this.#verifyOptions(options)

    if ($(options.ownElement) === null) {
      await this.#fetchContent(options.url, $(options.parent), options.after)
    }

    await this.showAndHideSiblings(options)

    if (this.current !== null && this.current.parent !== options.parent) {
      this.current.title = $('#nav-title').textContent

      this.history.push(this.current)

      this.#backBtn.style.visibility = 'visible'
    }

    if (typeof options.title !== 'undefined' && navTitle.textContent !== options.name) {
      navTitle.textContent = options.title
    }

    this.current = {
      parent: options.parent,
      displayAs: options.displayAs,
      container: options.container,
      title: $('#nav-title').textContent
    }
  }

  goBack = async () => {
    const histPrev = this.history.length > 0
      ? this.history.pop()
      : null

    if (histPrev !== null) {
      this.current = {
        parent: histPrev.parent,
        displayAs: histPrev.displayAs,
        container: histPrev.container
      }

      $('#nav-title').textContent = histPrev.title

      await this.showAndHideSiblings(this.current)
    }

    if (this.history.length === 0) {
      this.#backBtn.style.visibility = 'hidden'
    }
  }
}

// const App = new Spa()

export default Spa

export {
  Spa
}
