'use strict'

const dialog = document.getElementById('new-repo-dialog')

function newRepo () {
  dialog.showModal()
}

newRepo()

const repoTabButtons = Array.from(document.querySelectorAll('ul li'))
const repoTabs = {}

Array.from(document.querySelectorAll('div.new-repo-tab'))
  .forEach((t) => {
    repoTabs[t.id] = t
  })

function openNewRepoTab (name) {
  repoTabButtons.forEach((b) => {
    if (b.textContent !== name && b.classList.contains('active')) {
      b.classList.toggle('active')
      repoTabs[b.textContent.toLowerCase()].style.display = 'none'
    } else if (b.textContent === name && !b.classList.contains('active')) {
      b.classList.toggle('active')
      repoTabs[name.toLowerCase()].style.display = 'block'
    }
  })
}

repoTabButtons.forEach((l) => {
  l.addEventListener('click', (event) => {
    openNewRepoTab(event.currentTarget.textContent)
  })
})
