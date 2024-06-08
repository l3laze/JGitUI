'use strict'

import Spa from './Spa.mjs'
import $ from './jQuery-like.mjs'
// import highlight from './custom-microlight.mjs'
import { Highlighter } from './highlighter.mjs'

let App

async function initListeners () {
  const menuAdd = $('#menu-add')
  const backBtn = $('#nav-back-btn')
  const searchBar = $('#nav-search')
  const addDialog = $('#add-dialog')
  const menuCloseBtn = $('#menu-close')
  const searchBtn = $('#nav-search-btn')
  const menuBurger = $('#nav-hamburger')
  const menuSettings = $('#menu-settings')
  const searchCancelBtn = $('#nav-search-cancel')
  const codeElement = $('#repo-file-view > code')
  const dropdown = document.querySelector('#dropdown-main')

  const addDialogTabs = $.all('#add-dialog ul li')

  const fvBarWrap = $('#file-view-bar-wrap')
  const fvBarLineHeight = $('#file-view-bar-line-height')
  const fvBarFontSize = $('#file-view-bar-font-size')

  App = new Spa(backBtn)

  menuBurger.addEventListener('click', () => {
    if (window.getComputedStyle(dropdown).display !== 'none') {
      dropdown.style.display = 'none'
    } else {
      dropdown.style.display = 'flex'
    }
  })

  menuCloseBtn.addEventListener('click', () => {
    dropdown.style.display = 'none'
  })

  backBtn.addEventListener('click', async () => {
    menuCloseBtn.click()

    App.goBack()

    const fvMenuBar = $('#file-view-settings-bar')

    if (App.current.ownElement !== '#repo-file-list') {
      fvMenuBar.style.display = 'none'
    }
  })

  searchBtn.addEventListener('click', (event) => {
    event.cancelBubble = true

    if (window.getComputedStyle(searchBar).display !== 'none') {
      searchBar.style.display = 'none'
      searchCancelBtn.style.display = 'none'
    } else {
      searchBar.style.display = 'block'
      searchCancelBtn.style.display = 'inline'
      searchBar.focus()
    }
  })

  window.addEventListener('click', (event) => {
    const searchIsOpen = window.getComputedStyle(searchBar).display !== 'none'
    const isSearchBar = event.target.isEqualNode(searchBar) || event.target.isEqualNode(searchCancelBtn)

    if (!isSearchBar && searchIsOpen) {
      searchBtn.click()
    }

    const menuIsOpen = window.getComputedStyle(dropdown).display !== 'none'
    const isMenuNode = [menuBurger, menuCloseBtn, menuAdd, menuSettings].some((node) => event.target.isEqualNode(node))

    if (!isMenuNode && menuIsOpen) {
      menuCloseBtn.click()
    }
  })

  searchBar.addEventListener('keyup', (event) => {
    const shouldHide = (event.key === 'Escape' || event.key === 'Enter')

    if (event.key === 'Enter') {
      console.log(`searching repos ${event.target.value}`)
    }

    if (shouldHide) {
      event.target.style.display = 'none'

      searchCancelBtn.style.display = 'none'
    }
  })

  searchCancelBtn.addEventListener('click', (event) => {
    searchBar.value = ''

    searchBar.focus()
  })

  addDialog.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      addDialog.close()
    }
  })

  $('#close-dialog-btn').addEventListener('click', () => {
    addDialog.close()
  })

  $('#add-repo-form').addEventListener('submit', (event) => {
    event.preventDefault()
    addDialog.close()

    const activeTab = $('#add-tab-controls > li.active').textContent.toLowerCase()

    const submittedData = new FormData(document.getElementById('add-repo-form'))
    const fData = {}

    console.log(JSON.stringify(submittedData))

    for (const e of submittedData.entries()) {
      if (e[0].indexOf(activeTab) !== -1) {
        fData[e[0]] = e[1]
      }
    }

    console.log(activeTab, JSON.stringify(fData))

    return false // prevent default behavior
  })

  $('#add-dialog-cancel').addEventListener('click', () => {
    addDialog.close()
  })

  $('#menu-add').addEventListener('click', () => {
    menuCloseBtn.click()

    addDialog.show()
  })

  $('#menu-settings').addEventListener('click', () => {
    menuCloseBtn.click()

    console.log('opening settings')
  })

  $('#status-collapse').addEventListener('click', (event) => {
    const current = event.target.textContent

    event.target.textContent = current === '>' ? '˅' : '>'

    const statusBar = $('#status-bar')
    const statusHandle = $('#status-handle')

    if (current === '˅') {
      statusBar.style.display = 'none'

      $('footer').style.height = '1.8rem'

      statusHandle.style.display = 'none'

      $('footer > hr.non-resizable').style.display = 'block'

      $('footer > hr:not(.non-resizable)').style.display = 'none'
    } else {
      statusBar.style.display = 'block'

      $('footer > hr.non-resizable').style.display = 'none'

      $('footer > hr:not(.non-resizable)').style.display = 'block'

      $('footer').style.height = '4rem'

      statusHandle.style.display = 'block'
    }
  })

  $('#status-clear').addEventListener('click', () => {
    $('#status-bar').value = ''
  })

  /* Partially based on
   * https://medium.com/the-z/making-a-resizable-div-in-js-is-not-easy-as-you-think-bda19a1bc53d
   * at https://codepen.io/ZeroX-DG/pen/vjdoYe
   */

  function makeResizable (element, handle, minimum, maximum) {
    let resizingElement = ''
    let lastUpdated = Date.now()

    const original = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      mouse_x: 0,
      mouse_y: 0
    }

    const dir = resizingElement?.className?.split('-')[1]

    function resizeElement (event) {
      const timeDiff = Date.now() - lastUpdated

      if (timeDiff < 2) {
        return false
      } else {
        lastUpdated = Date.now()
      }

      const resizeDir = [
        {
          test: () => /[ns]{1,2}/.test(dir),
          resizeBy: 'height'
        }
      ].find((t) => t.test()).resizeBy

      const newHeight = original.height - (event.pageY - original.mouse_y)

      if (newHeight > minimum && newHeight < maximum) {
        resizingElement.style[resizeDir] = newHeight + 'px'
      }
    }

    function stopResizing () {
      resizingElement = ''

      window.removeEventListener('mousemove', resizeElement)
      window.removeEventListener('mouseup', stopResizing)
    }

    function startResizing (event) {
      if (event.target?.id === handle.id) {
        resizingElement = element

        original.width = parseFloat(window.getComputedStyle(resizingElement, null).getPropertyValue('width').replace('px', ''))
        original.height = parseFloat(window.getComputedStyle(resizingElement, null).getPropertyValue('height').replace('px', ''))
        original.x = resizingElement.getBoundingClientRect().left
        original.y = resizingElement.getBoundingClientRect().top
        original.mouse_x = event.pageX
        original.mouse_y = event.pageY

        window.addEventListener('mousemove', resizeElement)
        window.addEventListener('mouseup', stopResizing)
      }
    }

    element.classList.toggle('resizable')

    window.addEventListener('mousedown', startResizing)
  }

  makeResizable($('footer'), $('#status-handle'), '30', '480')

  addDialogTabs.forEach((t) => {
    t.addEventListener('click', (event) => {
      addDialogTabs.forEach((dialogTab) => dialogTab.classList.remove('active'))

      event.target.classList.add('active')

      $.all('div.container', addDialog).forEach((tabContainer) => {
        tabContainer.style.display = 'none'
      })

      $('#' + event.target.id.slice(0, event.target.id.lastIndexOf('-'))).style.display = 'block'
    })
  })

  const editor = $('#file-edit-view')
  const view = $('#repo-file-view')

  fvBarWrap.addEventListener('change', () => {
    if (window.getComputedStyle(codeElement).whiteSpace !== 'pre') {
      codeElement.style.whiteSpace = 'pre'
      editor.style.whiteSpace = 'pre'
    } else {
      codeElement.style.whiteSpace = 'break-spaces'
      editor.style.whiteSpace = 'break-spaces'
    }
  })

  fvBarLineHeight.addEventListener('change', () => {
    codeElement.style.lineHeight = fvBarLineHeight.value
    editor.style.lineHeight = fvBarLineHeight.value
  })

  fvBarFontSize.addEventListener('change', () => {
    codeElement.style.fontSize = fvBarFontSize.value + 'px'

    if (parseInt(codeElement.style.fontSize) > parseInt(window.getComputedStyle(codeElement).lineHeight)) {
      codeElement.style.lineHeight = Math.ceil(fvBarFontSize.value * 1.5) + 'px'
    }

    codeElement.style.lineHeight = ((window.getComputedStyle(codeElement).lineHeight) * 0.75).toString().substring(0, 3)

    editor.style.fontSize = codeElement.style.fontSize
    editor.style.lineHeight = codeElement.style.lineHeight
  })

  function syncScroll (from, to) {
    to.scrollTop = from.scrollTop
    to.scrollLeft = from.scrollLeft
  }

  editor.addEventListener('input', () => {
    syncScroll(editor, view)
  })

  editor.addEventListener('scroll', () => {
    syncScroll(editor, view)
  })

  view.addEventListener('scroll', () => {
    syncScroll(view, editor)
  })

  window.App = App
}

class Repo {
  files = {}
  commits = {}
  name = ''

  constructor (repoName) {
    this.name = repoName
  }

  addFile = async (file) => {
    let fileAddress
    let fileData

    try {
      const baseURL = window.location.href.slice(0, window.location.href.lastIndexOf('/'))

      fileAddress = new URL(file, baseURL)

      const requestFile = await fetch(fileAddress)

      fileData = await requestFile.text()
    } catch (err) {
      throw new Error(`Malformed URL: ${file}`)
    }

    this.files[fileAddress] = fileData
  }

  createCommit = async (message) => {
    let hash

    do {
      hash = Math.random().toString(16).substring(2).toUpperCase().substring(0, 8)
    } while (typeof this.commits[hash] !== 'undefined')

    this.commits[hash] = message
  }

  toJSON = () => {
    const commitKeys = Object.keys(this.commits)
    const latestCom = commitKeys[commitKeys.length - 1]

    return {
      name: this.name,
      latestMessage: `${this.commits[latestCom]}`,
      latestHash: `${latestCom}`
    }
  }

  toLI = () => {
    const repoTitle = document.createElement('h3')

    repoTitle.textContent = this.name

    const commitMessage = document.createElement('p')

    const commitKeys = Object.keys(this.commits)
    const latestCom = commitKeys[commitKeys.length - 1]

    commitMessage.textContent = this.commits[latestCom]

    const commitHash = document.createElement('span')

    commitHash.textContent = latestCom

    const repoListItem = document.createElement('li')

    repoListItem.appendChild(repoTitle)
    repoListItem.appendChild(commitMessage)
    repoListItem.appendChild(commitHash)

    return repoListItem
  }
}

class JGit {
  constructor () {
    this.repoList = []
    this.projectDir = ''
  }

  createRepo = async (options) => {
    const r = new Repo(options.name)

    this.repoList.push(r)

    return r
  }
}

initListeners()

async function openRepo (repoData) {
  const codeElement = $('#repo-file-view > code')
  const repoFilesUL = $('#repo-file-list')
  const existingFileLI = Array.from($.all('#repo-file-list li'))
    .map((f) => f.textContent.trim())

  const fileKeys = Object.keys(repoData.files)
    .filter((f) => {
      return existingFileLI.indexOf(f.slice(f.lastIndexOf('/') + 1)) === -1
    })

  for (const f of fileKeys) {
    const fileLI = document.createElement('li')

    fileLI.textContent = f.slice(f.lastIndexOf('/') + 1)

    repoFilesUL.appendChild(fileLI)

    fileLI.addEventListener('click', async () => {
      for (const c of codeElement.childNodes) {
        c.parentElement.removeChild(c)
      }

      codeElement.innerHTML = ''

      codeElement.textContent = repoData.files[f]

      // const fext = f.slice(f.lastIndexOf('.') + 1)

      // await highlight(codeElement, ['html', 'css', 'js', 'mjs', 'java'].indexOf(fext) === -1)

      const highlighter = new Highlighter()

      highlighter.highlight(codeElement)

      await App.loadContent({
        ownElement: '#repo-file-view',
        container: '#repo-view-container',
        parent: '#repo-file-view',
        displayAs: 'block',
        title: `...${f.slice(f.lastIndexOf('/'))}`
      })

      const lh = parseInt(window.getComputedStyle(codeElement).lineHeight)
      const fs = parseInt(window.getComputedStyle(codeElement).fontSize)

      const fvLineHeight = document.getElementById('file-view-bar-line-height')
      const fvFontSize = document.getElementById('file-view-bar-font-size')

      fvLineHeight.value = (lh / fs + 0.1).toString().substring(0, 3)

      fvFontSize.value = parseInt(window.getComputedStyle(codeElement).fontSize)

      const fvMenuBar = $('#file-view-settings-bar')

      if (window.getComputedStyle(fvMenuBar).display === 'none') {
        fvMenuBar.style.display = 'flex'
      }

      const fvEditor = $('#file-edit-view')

      fvEditor.style.display = 'block'

      /* eslint-disable-next-line no-irregular-whitespace */
      fvEditor.textContent = codeElement.textContent //.replace(/​/g, '')
      fvEditor.textContent = fvEditor.textContent.slice(0, -1)
    })
  }

  await App.loadContent({
    ownElement: '#repo-file-list',
    container: '#repo-view-container',
    parent: '#repo-file-list',
    displayAs: 'block',
    title: repoData.name
  })
}

async function initApp () {
  const jgit = new JGit()

  window.jgit = jgit

  const repoSelf = await jgit.createRepo({
    name: 'JGitUI Repo'
  })

  await repoSelf.addFile('./spa/spa.html')
  await repoSelf.addFile('./spa/spa.css')
  await repoSelf.addFile('./spa/Spa.mjs')
  await repoSelf.addFile('./spa/MainActivity.java')
  await repoSelf.addFile('./spa/thousand.js')
  await repoSelf.addFile('./spa/custom-microlight.mjs')
  await repoSelf.addFile('./spa/lexer.mjs')
  await repoSelf.addFile('./spa/highlighter.mjs')

  await repoSelf.createCommit('something, at least.')

  const repoLi = repoSelf.toLI()

  $('#repo-list').appendChild(repoLi)

  repoLi.addEventListener('click', async () => {
    const repoTitle = repoLi.querySelector('h3').textContent

    await openRepo(jgit.repoList.filter((r) => r.name === repoTitle)[0])
  })

  App.current = {
    parent: '#repo-list',
    displayAs: 'block',
    container: '#repo-view-container'
  }
}

initApp()
