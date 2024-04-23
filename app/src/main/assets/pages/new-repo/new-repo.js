'use strict'

const dialog = document.getElementById('new-repo-dialog')

function openNewRepoDialog () {
  dialog.showModal()
}

window.openNewRepoDialog = openNewRepoDialog

openNewRepoDialog()

const repoTabButtons = Array.from(document.querySelectorAll('#new-repo-tab-controls li'))
const repoTabs = {}

Array.from(document.querySelectorAll('div.new-repo-tab')).forEach((t) => {
  repoTabs[t.id] = t
})

function openNewRepoTab (name) {
  // console.log(`openNewRepoTab(${name})`)
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
    openNewRepoTab(event.target.textContent)
  })
})

document.getElementById('close-new-repo-dialog').addEventListener('click', () => {
  dialog.close()
})

document.getElementById('repo-tabs').addEventListener('submit', (event) => {
  event.preventDefault()

  const data = Array.from(new FormData(event.target).entries())

  console.log(data)

  dialog.close()
})

document.getElementById('new-repo-dialog-cancel').addEventListener('click', () => {
  dialog.close()
})
