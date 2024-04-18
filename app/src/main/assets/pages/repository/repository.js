'use strict'

window.addEventListener('DOMContentLoaded', function () {
  Array.from(document.querySelectorAll('.file-list-item'))
    .forEach((f) => {
      f.href = `./../fileview/fileview.html?file=${f.innerText}`
    })
})
