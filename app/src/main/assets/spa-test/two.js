'use strict'

/* global testThree, loadContent */

;((w) => {
  function testTwo () {
    console.log('Yup')
  }

  w.testTwo = testTwo

  document.getElementById('spa-test-two').addEventListener('click', async (event) => {
    const options = {
      url: './spa-test/three.html',
      container: '#spa-container',
      element: 'div.tab:nth-of-type(3)',
      displayAs: 'block',
      after: () => {
        testThree()
      },
      globals: ['testThree']
    }

    await loadContent(event, options)
  })
})(window)
