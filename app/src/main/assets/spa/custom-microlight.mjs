'use strict'

const _window = window
const _document = document
const appendChild = 'appendChild'
const test = 'test'

// style and color templates
const textShadow = ';text-shadow:'
/* eslint-disable camelcase */
const _3px_0px_5 = '3px 0px 5'
const brace = ')'
const highlightColors = ['none', 'skyblue', 'orchid', 'darkorange', 'olivedrab']
const color = ';color:'

function highlight (el, language, hashAsComment = false) {
  const text = el.textContent.replaceAll('\r\n', '\n')
  let pos = 0 // current position
  let next1 = text[0] // next character
  let chr = 1 // current character
  let prev1 // previous character
  let prev2 // the one before the previous
  let token = el.innerHTML = '' // current token content (and cleaning the node)

  // current token type:
  //  0: anything else (whitespaces / newlines)
  //  1: operator or brace
  //  2: closing braces (after which '/' is division not regex)
  //  3: (key)word
  //  4: regex
  //  5: string starting with "
  //  6: string starting with '
  //  7: xml comment  <!-- -->
  //  8: multiline comment /* */
  //  9: single-line comment starting with two slashes //
  // 10: single-line comment starting with hash #
  let tokenType = 0

  // kept to determine between regex and division
  let lastTokenType
  // flag determining if token is multi-character
  let multichar
  let node
  let codeLine = _document.createElement('code')

  // calculating the colors for the style templates
  const colorArr = /(\d*, \d*, \d*)(, ([.\d]*))?/.exec(
    _window.getComputedStyle(el).color
  )
  const pxColor = 'px rgba(' + colorArr[1] + ','
  const alpha = colorArr[3] || 1

  // running through characters and highlighting
  /* eslint-disable-next-line no-sequences */
  while (prev2 = prev1, prev1 = tokenType < 7 && prev1 === '\\' ? 1 : chr) {
  // escaping if needed (with exception for comments), previous character
  // will not be therefore recognized as a token finalize condition
    chr = next1
    next1 = text[++pos]
    multichar = token.length > 1

    // check if current token should be finalized
    if (!chr || // end of content
      // types 9-10 (single-line comments) end with a newline
      (tokenType > 8 && chr === '\n') ||
      [ // finalize conditions for other token types
        /\S/[test](chr), // 0: whitespaces. merged together
        1, // 1: operators. consist of a single character
        1, // 2: braces. consist of a single character
        !/[$\w]/[test](chr), // 3: (key)word
        (prev1 === '/' || prev1 === '\n') && multichar, // 4: regex
        prev1 === '"' && multichar, // 5: string with "
        prev1 === "'" && multichar, // 6: string with '
        text[pos - 4] + prev2 + prev1 === '-->', // 7: xml comment
        prev2 + prev1 === '*/' // 8: multiline comment
      ][tokenType]
    ) {
      // appending the token to the result
      if (token) {
        const tokenIndex = [
          !tokenType // not formatted
            ? 0 // punctuation
            : tokenType < 3
              ? 2 // comments
              : tokenType > 6
                ? 4 // regex and strings
                : tokenType > 3
                  ? 3
                  // otherwise tokenType === 3, (key)word (with +, becomes 1 if regexp matches, or 0 otherwise)
                  : +/^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto|sync|wait)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|on(sole|st(ructor)?)?|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do(cument|uble)|display|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or([eE]ach)?|ilter|riend|rom|unc(tion)?)|global|goto|guard|h(ead|ref)|i(f|mp(lements|licit|ort)|n(it|clude(s)?(_once)?|line|out|stanceof|t(erface|ernal)?)?|s|ndexOf)|l(ambda|e(ngth|t)|oc(ation|k)|ong|astIndexOf)|m(ap|icrolight|odule|utable)|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|f|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic|arentElement)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn|move(Child)?))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch|lice|tyle)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of)|extContent)|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|i(ndow|th))|xor|yield)$/[test](token)
        ]

        // remapping token type into style
        // (some types are highlighted similarly)
        codeLine[appendChild](
          node = _document.createElement('span')
        ).setAttribute('style', [
          '', // 0: not formatted
          // 1: keywords
          color + highlightColors[tokenIndex] +
          textShadow + _3px_0px_5 + 4 + pxColor + alpha * 0.7 + '),' +
          _3px_0px_5 + 2 + pxColor + alpha * 0.4 + brace,
          // 2: punctuation
          color + highlightColors[tokenIndex] +
          textShadow + _3px_0px_5 + 2 + pxColor + alpha / 2 + '),' +
          _3px_0px_5 + pxColor + alpha / 4 + brace,
          // 3: strings and regexps
          color + highlightColors[tokenIndex] +
          textShadow + _3px_0px_5 + pxColor + alpha / 3 + '),-' +
          _3px_0px_5 + pxColor + alpha * 0.4 + brace,
          // 4: comments
          color + highlightColors[tokenIndex] +
          textShadow + _3px_0px_5 + 4 + pxColor + alpha / 2 + '),-' +
          _3px_0px_5 + pxColor + alpha / 4 + brace
        ][tokenIndex])

        node[appendChild](_document.createTextNode(token))
      }

      // saving the previous token type (skipping whitespaces and comments)
      lastTokenType =
        (tokenType && tokenType < 7)
          ? tokenType
          : lastTokenType

      token = '' // initializing a new token

      // determining the new token type (going up the
      // list until matching a token type start condition)
      tokenType = 11
      while (![
        1, //  0: whitespace
        /[/{}[(\-+*=<>:|\\.,?!&@~;$]/[test](chr) || (chr === '#' && !hashAsComment), //  1: operator or braces
        /[[\](){}]/[test](chr), //  2: brace
        /[$\w]/[test](chr), //  3: (key)word
        chr === '/' && //  4: regex
        (lastTokenType < 2) && // previous token was an opening brace or an operator (otherwise division, not a regex)
        prev1 !== '<', // workaround for xml closing tags
        chr === '"', //  5: string with "
        chr === "'", //  6: string with '
        // chr === '`' // 7: string with `
        chr + next1 + text[pos + 1] + text[pos + 2] === '<!--', //  7: xml comment
        chr + next1 === '/*', //  8: multiline comment
        chr + next1 === '//', //  9: single-line comment
        chr === '#' && hashAsComment // 10: hash-style comment
      ][--tokenType]);
    }

    if (chr === '\n') {
      codeLine[appendChild](_document.createTextNode('\n')) // to preserve newlines during copy

      el[appendChild](codeLine)

      codeLine = _document.createElement('code')
    } else {
      // Don't add \n to token
      token += chr
    }
  }

  if (text[text.length - 1] === '\n') {
    el[appendChild](_document.createElement('code'))
  }
}

export default highlight

export {
  highlight
}
