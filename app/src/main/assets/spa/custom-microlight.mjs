'use strict'

import { lexer } from './lexer.mjs'
import { Highlighter } from './highlighter.mjs'

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
/* const defaultKeywords =
  'abstract,alias,and,arguments,array,asm,assert,async,await,'
  + 'base,begin,bool,boolean,break,byte,'
  + 'case,catch,char,checked,class,clone,compl,console,constructor,continue,'
  + 'debugger,decimal,declare,def,fault,defer,delegate,delete,do,document,double,display,'
  + 'echo,elseif,else,ensure,enum,event,except,exec,explicit,export,extend,'
  + 'fallthrough,false,final,finally,fixed,float,foreach,filter,friend,from,function,'
  + 'global,goto,guard,'
  + 'head,href'
  + 'if,implements,implicit,import,include,includes,include_once,inline,instanceof,int,indexOf,'
  + 'lambda,length,let,location,lock,long,lastIndexOf,'
  + 'map,module,mutable,'
  + 'NaN,namespace,native,next,new,nil,not,null,'
  + 'object,of,operator,or,out,override,'
  + 'package,params,private,protected,protocol,public,parentElement,'
  + 'raise,readonly,redo,ref,register,repeat,require,require_once,rescue,restrict,return,remove,removeChild,'
  + 'sbyte,sealed,self,short,signed,sizeof,static,string,struct,subscript,super,synchronized,switch,slice,style,'
  + 'template,then,this,throw,throws,transient,true,try,type,typealias,typedef,typeid,typename,'
  + 'unchecked,undefined,union,unless,unsigned,until,use,using,'
  + 'var,virtual,void,volatile,'
  + 'wchar_t,when,where,while,window,width,'
  + 'xor,'
  + 'yield'
    .split(',')
*/

async function highlight (el, hashAsComment = false) {
  let text = el.textContent.replaceAll('\r\n', '\n')

  if (text[text.length - 1] !== '\n') {
    text += '\n'
  }

  let pos = 0 // current position
  let next1 = text[0] // next character
  let chr = 1 // current character
  let prev1 // previous character
  let prev2 // the one before the previous
  let token = '' // current token content

  // current token type:
  //  0: anything else (whitespaces / newlines)
  //  1: operator or brace
  //  2: closing braces (after which '/' is division not regex)
  //  3: (key)word
  //  4: regex
  //  5: string starting with "
  //  6: string starting with '
  //  7: string starting with `
  //  8: xml comment  <!-- -->
  //  9: multiline comment /* */
  // 10: single-line comment starting with two slashes //
  // 11: single-line comment starting with hash #

  let tokenType = 0

  // kept to determine between regex and division
  let lastTokenType
  // flag determining if token is multi-character
  let multichar
  let node
  let codeLine = _document.createElement('code')
  // let lineCount = 0

  // calculating the colors for the style templates
  const colorArr = /(\d*, \d*, \d*)(, ([.\d]*))?/.exec(
    _window.getComputedStyle(el).color
  )
  const pxColor = 'px rgba(' + colorArr[1] + ','
  const alpha = colorArr[3] || 1

  const zeroWidthSpace = '​' // &ZeroWidthSpace;

  el.innerHTML = '' // clean the node

  // running through characters and highlighting
  /* eslint-disable-next-line no-sequences */
  while (prev2 = prev1, prev1 = (tokenType < 8 && prev1 === '\\') ? 1 : chr) {
  // escaping if needed (with exception for comments), previous character
  // will not be therefore recognized as a token finalize condition
    chr = next1
    next1 = text[++pos]
    multichar = token.length > 1

    // check if current token should be finalized
    if (!chr || // end of content
      // types 10-11 (single-line comments) end with a newline
      (tokenType > 9 && chr === '\n') ||
      [ // finalize conditions for other token types
        /\S/[test](chr), // 0: whitespaces. merged together
        1, // 1: operators. consist of a single character
        1, // 2: braces. consist of a single character
        !/[$\w]/[test](chr), // 3: (key)word
        (prev1 === '/' || prev1 === '\n') && multichar, // 4: regex
        prev1 === '"' && multichar, // 5: string with "
        prev1 === "'" && multichar, // 6: string with '
        prev1 === '`' && multichar, // 7: string with `
        text[pos - 4] + prev2 + prev1 === '-->', // 8: xml comment
        prev2 + prev1 === '*/' // 9: multiline comment
      ][tokenType]
    ) {
      // appending the token to the result
      if (token) {
        const tokenIndex = [
          !tokenType
            ? 0 // not formatted
            : tokenType < 3
              ? 2 // punctuation
              : tokenType > 7
                ? 4 // comments
                : tokenType > 3
                  ? 3 // regex and strings
                  // otherwise tokenType === 3, (key)word (with +, becomes 1 if regexp matches, or 0 otherwise)
                  : +/^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto|sync|wait)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|on(sole|st(ructor)?)?|ontinue)|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do(cument|uble)|display|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or([eE]ach)?|ilter|riend|rom|unc(tion)?)|global|goto|guard|h(ead|ref)|i(f|mp(lements|licit|ort)|n(it|clude(s)?(_once)?|line|out|stanceof|t(erface|ernal)?)?|s|ndexOf)|l(ambda|e(ngth|t)|oc(ation|k)|ong|astIndexOf)|m(ap|icrolight|odule|utable)|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|f|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic|arentElement)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn|move(Child)?))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch|lice|tyle)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of)|extContent)|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|i(ndow|th))|xor|yield)$/[test](token)]

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

        // node.setAttribute('id', `code-span-${spanCount}`)

        if (tokenType > 0 || tokenType < 4 || tokenType > 4) {
          const temp = _document.createElement('span')

          // for (const t of token.split('')) {
          //   temp.appendChild(_document.createTextNode(t))

          //   temp.appendChild(_document.createTextNode(zeroWidthSpace))
          // }

          temp.appendChild(_document.createTextNode(token + zeroWidthSpace))

          node[appendChild](temp)
        } else {
          node[appendChild](_document.createTextNode(token))
        }

        codeLine[appendChild](_document.createElement('span').appendChild(_document.createTextNode(zeroWidthSpace)))
      }

      // saving the previous token type (skipping whitespaces and comments)
      lastTokenType =
        (tokenType && tokenType < 8)
          ? tokenType
          : lastTokenType

      token = '' // initializing a new token

      // determining the new token type (going up the
      // list until matching a token type start condition)
      tokenType = 12
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
        chr === '`', // 7: string with `
        chr + next1 + text[pos + 1] + text[pos + 2] === '<!--', //  8: xml comment
        chr + next1 === '/*', //  9: multiline comment
        chr + next1 === '//', // 10: single-line comment
        chr === '#' && hashAsComment // 11: hash-style comment
      ][--tokenType]);
    }

    if (chr === '\n') {
      // Preserve newlines in text representation.

      const newLine = _document.createElement('span')

      newLine.appendChild(_document.createTextNode('\n'))

      codeLine[appendChild](newLine)

      codeLine.classList.add('has-spaces')

      const spaces = /(?<spaces>[ ]*)/.exec(codeLine.textContent)

      // lineCount++

      codeLine.setAttribute('data-spaces', spaces.groups.spaces.length)

      // console.log(`${lineCount}: "${spaces.groups.spaces}" ${codeLine.getAttribute('data-spaces')}`)

      el[appendChild](codeLine)

      codeLine = _document.createElement('code')
    } else {
      // Don't add \n to tokens
      token += chr
    }
  }

  // Empty line at eof file
  if (text[text.length - 1] === '\n') {
    el[appendChild](_document.createElement('code'))
  }
}

export default highlight

export {
  highlight
}
