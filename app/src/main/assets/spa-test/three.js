'use strict'

/* global loadContent */

;((w) => {
  function testThree () {
    console.log('3rd time was not a charm')
  }

  w.testThree = testThree

  function testOthers () {
    w.testOne()
    w.testTwo()
  }

  document.getElementById('spa-test-three').addEventListener('click', async (event) => {
    const options = {
      url: './spa-test/two.html',
      container: '#spa-container',
      element: 'div.tab:nth-of-type(2)',
      displayAs: 'block',
      after: () => {
        testOthers()
      },
      globals: ['testOne', 'testTwo']
    }

    await loadContent(event, options)
  })
})(window)
