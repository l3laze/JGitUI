'use strict'

const $ = (selector, parent = document) => {
  const q = typeof parent === 'string'
    ? $(parent)
    : parent

  return q.querySelector(selector)
}

$.all = (selector, parent = document) => {
  const q = typeof parent === 'string'
    ? $(parent)
    : parent

  return q.querySelectorAll(selector)
}

export default $

export {
  $
}
