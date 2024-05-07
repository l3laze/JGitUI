function highlightElement (el, hashAsComment = false) {
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

  // style and color templates
  const textShadow = ';text-shadow:'
  /* eslint-disable camelcase */
  const _3px_0px_5 = '3px 0px 5'
  const brace = ')'

  const text = el.textContent.replaceAll('\r\n', '\n')

  let offset = 0
  let next1 = text[0]
  let prev1 = ''
  let prev2 = ''
  let token = ''

  el.innerHTML = ''

  let tokenType = 0
  let lastTokenType
  let multichar
  let node

  // calculating the colors for the style templates
  const colorArr = /(\d*, \d*, \d*)(, ([.\d]*))?/.exec(
    window.getComputedStyle(el).color
  )
  const pxColor = 'px rgba(' + colorArr[1] + ','
  const alpha = colorArr[3] || 1

  let codeLine = document.createElement('code')

  for (let chr = text[offset]; offset < text.length; offset++) {
    next1 = offset + 1 < text.length ? text[offset + 1] : ''
    multichar = token.length > 1

    const shouldFinalize = (tType) => [
      () => /\S/.test(chr), // 0: whitespace
      () => 1, // 1: operator
      () => 1, // 2: braces
      () => !/[$\w]/.test(chr), // 3: keyword, word
      () => (prev1 === '/' || prev1 === '\n') && multichar, // 4: regex
      () => (prev1 === '"' && multichar), // 5: string with "
      () => (prev1 === '"' && multichar), // 6: string with '
      () => (prev1 === '`' && multichar), // 7: string with `
      () => (text[offset - 4] + prev2 + prev1 === '-->'), // 8: end of xml comment
      () => (prev2 + prev1 === '*/') // 9: multiline comment
    ][tType]()

    if (offset === text.length || shouldFinalize(tokenType)) {
      if (token) {
        const tokenFormatMap = {
          _0: 0,
          _1: 2,
          _2: 2,
          _3: 1,
          _4: 3,
          _5: 3,
          _6: 3,
          _7: 3,
          _8: 4,
          _9: 4
        }

        const node = document.createElement('span')

        const tokenIndex = tokenFormatMap['_' + tokenType]

        node.setAttribute('style', [
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

        node.appendChild(document.createTextNode(token))

        lastTokenType =
        (tokenType && tokenType < 8)
          ? tokenType
          : lastTokenType

        token = ''

        tokenType = 12
        while (![
          1, //  0: whitespace
          /[/{}[(\-+*=<>:|\\.,?!&@~;$]/.test(chr) || (chr === '#' && !hashAsComment), //  1: operator or braces
          /[[\](){}]/.test(chr), //  2: brace
          /[$\w]/.test(chr), //  3: (key)word
          chr === '/' && //  4: regex
          (lastTokenType < 2) && // previous token was an opening brace or an operator (otherwise division, not a regex)
          prev1 !== '<', // workaround for xml closing tags
          chr === '"', //  5: string with "
          chr === "'", //  6: string with '
          chr === '`', // 7: string with `
          chr + next1 + text[offset + 1] + text[offset + 2] === '<!--', //  8: xml comment
          chr + next1 === '/*', //  9: multiline comment
          chr + next1 === '//', // 10: single-line comment
          chr === '#' && hashAsComment // 11: hash-style comment
        ][--tokenType]);
      }

      if (chr === '\n') {
        // Preserve newlines in text representation.

        const newLine = document.createElement('span')

        // spanCount++
        // newLine.setAttribute('id', `code-span-${spanCount}`)

        newLine.appendChild(document.createTextNode('\n'))

        codeLine.appendChild(newLine)

        el.appendChild(codeLine)

        codeLine = document.createElement('code')
      } else {
        // Don't add \n to token
        token += chr
      }
    }

    if (text[text.length - 1] === '\n') {
      el.appendChild(document.createElement('code'))
    }

    prev2 = prev1
    prev1 = chr
  }
}

export default highlightElement

export {
  highlightElement
}
