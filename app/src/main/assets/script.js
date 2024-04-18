'use strict'

/* global android, XMLHttpRequest */

class AsyncValue {
  #value
  #lastUpdated

  constructor (initialValue) {
    this.#value = initialValue
    this.#lastUpdated = performance.now()
  }

  get value () {
    return this.#value
  }

  set value (v) {
    this.#value = v
    this.#lastUpdated = performance.now()
  }

  async waitForChange (pollTime = 10) {
    let counter = 0

    const latest = this.#lastUpdated

    const fractionOfSecondMultiplier = 1000 / pollTime

    // console.log(pollTime + ' ' + fractionOfSecondMultiplier)

    do {
      await sleep(pollTime)

      counter++
    } while (latest === this.#lastUpdated)

    return [counter / fractionOfSecondMultiplier, this.#value]
  }

  lastModified () {
    return this.#lastUpdated
  }

  toString () {
    return this.#value.toString()
  }
}

const perms = {
  storage: new AsyncValue(false)
}

const splashScreen = document.getElementById('splash')
const searchBtn = document.getElementById('menu-bar-search')
const stat = document.getElementById('status')
const storagePermState = document.getElementById('storage-permission-state')
const storageBtn = document.getElementById('update-storage-permission')

/*
 * Based on https://www.bayanbennett.com/posts/how-does-mdn-intercept-console-log-devlog-003/
 */

const _con = {
  log: console.log,
  error: console.error
}

console.error = function (e) {
  log(e)

  _con.error.apply(console, arguments)
}

console.log = function () {
  const argList = []

  for (const value of arguments) {
    argList.push(value.constructor.name === 'Object'
      ? JSON.stringify(value)
      : value.toString())
  }

  log(argList.join(' '))

  _con.log.apply(console, arguments)
}

/* eslint-disable-next-line no-unused-vars */
function isAndroidOS () {
  return navigator.userAgent.toLowerCase().indexOf('android') > -1
}

window.addEventListener('DOMContentLoaded', async function () {
  if (isAndroidOS() || (window.location.href.indexOf('http://') === 0 || window.location.href.indexOf('127.0.0.1:3000') === 0)) {
    if (typeof window.Prism !== 'undefined') {
      console.log('Prism!')
    } else {
      console.warn('Failed to load Prism from CDN')
    }
  } else {
    console.log('Skipping Prism')
  }

  const query = window.location.href.split('?')[1] || ''

  console.log(query)

  if (query.length > 0) {
    const args = query.split('=')

    if (args.length % 2 !== 0) {
      throw new Error(`Malformed URL: ${window.location.href}`)
    }

    for (let i = 0; i < args.length; i++) {
      if (args[i] === 'storage') {
        perms.storage.value = (args[i + 1] === 'true')
      }
    }
  }

  if (perms.storage.value) {
    updatePerms('storage')
  } else {
    toggleDisplay('splash', 'flex')

    this.setTimeout(() => {
      storageBtn.click()
    }, 1000)
  }

  storagePermState.classList = `permission-${perms.storage.value ? 'granted' : 'denied'}`

  Array.from(document.querySelectorAll('.repo-list-name'))
    .forEach((r) => {
      r.href = `./pages/repository/repository.html?repo=${r.innerText}`
    })
})

function updatePerms (perm, state = false) {
  document.getElementById(`${perm}-permission-state`).classList = `permission-${state ? 'granted' : 'denied'}`

  if (window.getComputedStyle(splashScreen).display !== 'none') {
    toggleDisplay('splash')
    toggleDisplay('menu-bar')
  } else {
    toggleDisplay('menu-bar')
  }
}

function log (message) {
  if (stat.value !== '') {
    stat.value += '\n'
  }

  stat.value += message
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toggleDisplay (el, displayAs = 'block') {
  const element = document.getElementById(el)

  if (window.getComputedStyle(element).display === 'none' || element.style.display === 'none') {
    element.style.display = displayAs
  } else {
    element.style.display = 'none'
  }
}

async function requestPermission (permName) {
  if (isAndroidOS() && !perms[permName].value) {
    android.requestPermission(permName)
  } else {
    setTimeout(() => {
      perms[permName].value = !perms[permName].value
    }, 0)
  }

  /* eslint-disable-next-line no-unused-vars */
  const [time, result] = await perms[permName].waitForChange()

  // console.log(`Waited about ${time} seconds.`, `${permName} permission: ${result ? 'Granted' : 'Denied'}`)

  if (result || typeof android === 'undefined') {
    updatePerms(permName, result)
  }
}

storageBtn.addEventListener('click', (event) => {
  requestPermission(event.currentTarget.id.split('-')[1])
})

document.getElementById('menu-bar-hamburger').addEventListener('click', () => {
  document.getElementById('menu-sidebar').style.display = 'block'
})

document.getElementById('sidebar-close').addEventListener('click', (event) => {
  event.currentTarget.parentElement.style.display = 'none'
})

searchBtn.addEventListener('click', function () {
  toggleDisplay('menu-search')
})

document.getElementById('init-btn').addEventListener('click', () => {
  android.init('/example/path')
})

function loadCSS (styleFile) {
  const fileref = document.createElement('link')

  fileref.rel = 'stylesheet'
  fileref.type = 'text/css'
  fileref.href = styleFile

  document.getElementsByTagName('head')[0].appendChild(fileref)
}

function loadScript (scriptFile) {
  const script = document.createElement('script')

  script.type = 'text/javascript'
  script.async = true
  script.src = scriptFile

  const s = document.getElementsByTagName('script')[0]

  s.parentNode.insertBefore(script, s)
}

async function loadContentFetch (event, content, element) {
  event.preventDefault()

  try {
    const response = await fetch(content.html)

    const html = await response.text()

    loadCSS(content.css)

    element.innerHTML = html
    loadScript(content.js)
  } catch (err) {
    console.warn(err)
  }
}

function loadContentXHR (event, content, element) {
  event.preventDefault()

  const xhr = new XMLHttpRequest()

  xhr.onreadystatechange = function (e) {
    if (xhr.readyState === 4 && xhr.status === 200) {
      element.innerHTML = xhr.responseText

      executeScript(element)
    }
  }

  xhr.open('GET', content.html, true)
  xhr.setRequestHeader('Content-type', 'text/html')
  xhr.send()
}

document.getElementById('new-repo-btn').addEventListener('click', async (event) => {
  const container = document.querySelector('#main-page #container')

  if (!event.currentTarget.getAttribute('data-has-loaded')) {
    event.currentTarget.setAttribute('data-has-loaded', true)

    await loadContentFetch(event, {
      html: './pages/new-repo/new-repo.html',
      css: './pages/new-repo/new-repo.css',
      js: './pages/new-repo/new-repo.js'
    }, container)
  } else {
    newRepo()
  }
})

/* eslint-disable-next-line no-unused-vars */
const fs = {
  promises: {
    exists: async function fileExists (path) {
      if (android.havePermission()) {
        return (await android.fileExists(path))
      }

      return false
    },

    readFile: async function readFile (path) {
      if (android.havePermission()) {
        return (await android.readFile(path))
      }
    },

    writeFile: async function writeFile (path, data) {
      if (android.havePermission()) {
        const result = await android.writeFile(path, data)

        if (result !== '') {
          throw new Error(result)
        }
      } else {
        throw new Error(`Do not have permission to write file ${path}`)
      }
    },

    mkdir: async function mkdir (path) {
      if (android.havePermission()) {
        await android.makeDirectory(path)
      }
    },

    mkdirp: async function mkdirp (path) {
      if (android.havePermission()) {
        await android.makeDirectoryTree(path)
      }
    },

    rename: async function rename (from, to) {
      if (android.havePermission()) {
        await android.move(from, to)
      }
    },

    stat: async function stat (path) {
      if (android.havePermission()) {
        const stats = (await android.stat(path))

        if (stats.indexOf('"error') === 0) {
          throw new Error(JSON.parse(stats).error)
        }

        return JSON.parse(stats)
      }
    },

    readdir: async function readdir (path) {
      if (android.havePermission()) {
        const result = await android.readDir(path)

        if (result.indexOf('"error') === 0) {
          throw new Error(JSON.parse(result).error)
        }

        return result
      }
    },

    delete: async function deletePath (path) {
      if (android.havePermission()) {
        await android.delete(path)
      }
    },

    rmdir: async function rmdir (path) {
      if (android.havePermission()) {
        await android.rmdir(path)
      }
    },

    du: async function du (path) {
      if (android.havePermission()) {
        return (await android.sizeOnDisk(path))
      }
    },

    readlink: async function readlink (path) {
      if (android.havePermission()) {
        const result = (await android.readlink(path))

        if (result.indexOf('"error') === 0) {
          throw new Error(JSON.parse(result))
        }

        return JSON.parse(result)
      }
    },

    lstat: async function lstat (path) {
      if (android.havePermission()) {
        const stats = (await android.lstat(path))

        if (stats.indexOf('"error') === 0) {
          throw new Error(JSON.parse(stats).error)
        }

        return JSON.parse(stats)
      }
    },

    symlink: async function symlink (from, to) {
      if (android.havePermission()) {
        const result = (await android.createSymlink(from, to))

        return JSON.parse(result)
      }
    }
  },

  existsSync: function fileExistsSync (path) {
    return android.fileExists(path)
  }
}

/* eslint-disable-next-line no-unused-vars */
const path = {
  normalize: (p) => {
    return android.normalize(p)
  },

  relativize: (p) => {
    return android.relativize(p)
  },

  dirname: (p) => {
    return android.dirname(p)
  },

  getAbsolutePath: (p) => {
    return android.getAbsolutePath(p)
  },

  join: (a, b) => {
    return android.resolve(a, b)
    // return a + '/' + b
  }
}

/* eslint-disable-next-line no-unused-vars */
const process = {
  pwd: () => android.pwd(),

  stderr: (message) => {
    console.log(message)
  },

  stdout: (message) => {
    console.log(message)
  }
}
