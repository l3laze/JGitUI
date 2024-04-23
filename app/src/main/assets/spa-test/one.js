'use strict'

/* global loadContent, testTwo */

;((w) => {
  function testOne () {
    // console.log('Hi')
  }

  w.testOne = testOne

  document.getElementById('spa-test-one').addEventListener('click', async (event) => {
    const options = {
      url: './spa-test/two.html',
      container: '#spa-container',
      element: 'div.tab:nth-of-type(2)',
      displayAs: 'block',
      after: () => {
        testTwo()
      },
      globals: ['testTwo']
    }

    await loadContent(event, options)
  })
})(window)
