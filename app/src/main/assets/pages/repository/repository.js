'use strict'

/* global fetchContent, openFileview */

Array.from(document.querySelectorAll('.file-list-item'))
  .forEach((f) => {
    f.addEventListener('click', async (event) => {
      if (!event.target.getAttribute('data-has-loaded')) {
        event.target.setAttribute('data-has-loaded', true)

        await fetchContent(event, './pages/fileview/fileview.html', document.querySelector('#main-page #container'))
      }

      setTimeout(() => {
        document.getElementById('file-view-container').setAttribute('data-file', event.target.textContent)

        openFileview()
      }, 50)
    })
  })

document.querySelector('.file-list-item').click()

/* eslint-disable-next-line no-unused-vars */
function openRepo (name) {
  console.log(`opening repo: ${name}`)
}

window.openRepo()