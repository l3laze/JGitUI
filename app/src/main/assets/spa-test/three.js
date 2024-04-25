'use strict'

/* global loadContent */

;((w) => {
  function testThree () {
    console.log('3rd time was not a charm')
  }

  w.testThree = testThree

  document.getElementById('spa-test-three').addEventListener('click', async (event) => {
    const options = {
      url: './spa-test/two.html',
      container: '#spa-container',
      element: 'div.tab:nth-of-type(2)',
      self: '#spa-test-two',
      displayAs: 'block',
      after: () => {
        testTwo()
      }
    }

    await loadContent(event, options)
  })

  document.getElementById('spa-test-four').addEventListener('click', async (event) => {
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
})(window)
