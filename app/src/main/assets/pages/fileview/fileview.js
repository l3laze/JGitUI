'use strict'

/* global Prism */

document.addEventListener('DOMContentLoaded', () => {
  const loc = window.location.href

  if (loc.indexOf('?') === -1) {
    throw new Error('No query in URL')
  }

  const query = loc.split('?')[1]

  if (query.length === 0) {
    throw new Error('No content in query')
  }

  const args = query.split('=')

  if ((args.length % 2) !== 0) {
    throw new Error('Malformed query')
  }

  const options = {}
  const possibleOptions = [
    'file'
  ]

  console.log(loc, query, args, typeof options)

  for (let i = 0; i < args.length / 2; i += 2) {
    if (possibleOptions.indexOf(args[i]) !== -1) {
      options[args[i]] = args[i + 1]
    }
  }

  if (options.file) {
    const container = document.querySelector('#file-view-container code')

    container.classList.add(`language-${getPrismLanguageCode(options.file.split('.')[1])}`)

    container.textContent = '<style>\ndiv {\n  box-sizing: border-box;\n}\n</style>\n\n<div id="greeting">Hi there.</div>\n\n<script type="text/javascript">\nconst hello = \'world\'\n\nconsole.log(hello)\n</script>'

    Prism.highlightElement(container)
  }
})

function getPrismLanguageCode (extension) {
  /*
    console.log('{' + Array.from(document.querySelectorAll('#languages-list ul li')).map((l) => {
      const data = l.textContent.split(' - ')

      return `"${l.dataset.id}": "${data.slice(1)}"`
    }) + '}')
  */
  /* standard-js-disable quoted-props */
  const languages = {
    markup: 'markup, html, xml, svg, mathml, ssml, atom, rss',
    css: 'css',
    clike: 'clike',
    javascript: 'javascript, js',
    abap: 'abap',
    abnf: 'abnf',
    actionscript: 'actionscript',
    ada: 'ada',
    agda: 'agda',
    al: 'al',
    antlr4: 'antlr4, g4',
    apacheconf: 'apacheconf',
    apex: 'apex',
    apl: 'apl',
    applescript: 'applescript',
    aql: 'aql',
    arduino: 'arduino, ino',
    arff: 'arff',
    armasm: 'armasm, arm-asm',
    arturo: 'arturo, art',
    asciidoc: 'asciidoc, adoc',
    aspnet: 'aspnet',
    asm6502: 'asm6502',
    asmatmel: 'asmatmel',
    autohotkey: 'autohotkey',
    autoit: 'autoit',
    avisynth: 'avisynth, avs',
    'avro-idl': 'avro-idl, avdl',
    awk: 'awk, gawk',
    bash: 'bash, sh, shell',
    basic: 'basic',
    batch: 'batch',
    bbcode: 'bbcode, shortcode',
    bbj: 'bbj',
    bicep: 'bicep',
    birb: 'birb',
    bison: 'bison',
    bnf: 'bnf, rbnf',
    bqn: 'bqn',
    brainfuck: 'brainfuck',
    brightscript: 'brightscript',
    bro: 'bro',
    bsl: 'bsl, oscript',
    c: 'c',
    csharp: 'csharp, cs, dotnet',
    cpp: 'cpp',
    cfscript: 'cfscript, cfc',
    chaiscript: 'chaiscript',
    cil: 'cil',
    cilkc: 'cilkc, cilk-c',
    cilkcpp: 'cilkcpp, cilk-cpp, cilk',
    clojure: 'clojure',
    cmake: 'cmake',
    cobol: 'cobol',
    coffeescript: 'coffeescript, coffee',
    concurnas: 'concurnas, conc',
    csp: 'csp',
    cooklang: 'cooklang',
    coq: 'coq',
    crystal: 'crystal',
    'css-extras': 'css-extras',
    csv: 'csv',
    cue: 'cue',
    cypher: 'cypher',
    d: 'd',
    dart: 'dart',
    dataweave: 'dataweave',
    dax: 'dax',
    dhall: 'dhall',
    diff: 'diff',
    django: 'django, jinja2',
    'dns-zone-file': 'dns-zone-file, dns-zone',
    docker: 'docker, dockerfile',
    dot: 'dot, gv',
    ebnf: 'ebnf',
    editorconfig: 'editorconfig',
    eiffel: 'eiffel',
    ejs: 'ejs, eta',
    elixir: 'elixir',
    elm: 'elm',
    etlua: 'etlua',
    erb: 'erb',
    erlang: 'erlang',
    'excel-formula': 'excel-formula, xlsx, xls',
    fsharp: 'fsharp',
    factor: 'factor',
    false: 'false',
    'firestore-security-rules': 'firestore-security-rules',
    flow: 'flow',
    fortran: 'fortran',
    ftl: 'ftl',
    gml: 'gml, gamemakerlanguage',
    gap: 'gap',
    gcode: 'gcode',
    gdscript: 'gdscript',
    gedcom: 'gedcom',
    gettext: 'gettext, po',
    gherkin: 'gherkin',
    git: 'git',
    glsl: 'glsl',
    gn: 'gn, gni',
    'linker-script': 'linker-script, ld',
    go: 'go',
    'go-module': 'go-module, go-mod',
    gradle: 'gradle',
    graphql: 'graphql',
    groovy: 'groovy',
    haml: 'haml',
    handlebars: 'handlebars, hbs, mustache',
    haskell: 'haskell, hs',
    haxe: 'haxe',
    hcl: 'hcl',
    hlsl: 'hlsl',
    hoon: 'hoon',
    http: 'http',
    hpkp: 'hpkp',
    hsts: 'hsts',
    ichigojam: 'ichigojam',
    icon: 'icon',
    'icu-message-format': 'icu-message-format',
    idris: 'idris, idr',
    ignore: 'ignore, gitignore, hgignore, npmignore',
    inform7: 'inform7',
    ini: 'ini',
    io: 'io',
    j: 'j',
    java: 'java',
    javadoc: 'javadoc',
    javadoclike: 'javadoclike',
    javastacktrace: 'javastacktrace',
    jexl: 'jexl',
    jolie: 'jolie',
    jq: 'jq',
    jsdoc: 'jsdoc',
    'js-extras': 'js-extras',
    json: 'json, webmanifest',
    json5: 'json5',
    jsonp: 'jsonp',
    jsstacktrace: 'jsstacktrace',
    'js-templates': 'js-templates',
    julia: 'julia',
    keepalived: 'keepalived',
    keyman: 'keyman',
    kotlin: 'kotlin, kt, kts',
    kumir: 'kumir, kum',
    kusto: 'kusto',
    latex: 'latex, tex, context',
    latte: 'latte',
    less: 'less',
    lilypond: 'lilypond, ly',
    liquid: 'liquid',
    lisp: 'lisp, emacs, elisp, emacs-lisp',
    livescript: 'livescript',
    llvm: 'llvm',
    log: 'log',
    lolcode: 'lolcode',
    lua: 'lua',
    magma: 'magma',
    makefile: 'makefile',
    markdown: 'markdown, md',
    'markup-templating': 'markup-templating',
    mata: 'mata',
    matlab: 'matlab',
    maxscript: 'maxscript',
    mel: 'mel',
    mermaid: 'mermaid',
    metafont: 'metafont',
    mizar: 'mizar',
    mongodb: 'mongodb',
    monkey: 'monkey',
    moonscript: 'moonscript, moon',
    n1ql: 'n1ql',
    n4js: 'n4js, n4jsd',
    'nand2tetris-hdl': 'nand2tetris-hdl',
    naniscript: 'naniscript, nani',
    nasm: 'nasm',
    neon: 'neon',
    nevod: 'nevod',
    nginx: 'nginx',
    nim: 'nim',
    nix: 'nix',
    nsis: 'nsis',
    objectivec: 'objectivec, objc',
    ocaml: 'ocaml',
    odin: 'odin',
    opencl: 'opencl',
    openqasm: 'openqasm, qasm',
    oz: 'oz',
    parigp: 'parigp',
    parser: 'parser',
    pascal: 'pascal, objectpascal',
    pascaligo: 'pascaligo',
    psl: 'psl',
    pcaxis: 'pcaxis, px',
    peoplecode: 'peoplecode, pcode',
    perl: 'perl',
    php: 'php',
    phpdoc: 'phpdoc',
    'php-extras': 'php-extras',
    'plant-uml': 'plant-uml, plantuml',
    plsql: 'plsql',
    powerquery: 'powerquery, pq, mscript',
    powershell: 'powershell',
    processing: 'processing',
    prolog: 'prolog',
    promql: 'promql',
    properties: 'properties',
    protobuf: 'protobuf',
    pug: 'pug',
    puppet: 'puppet',
    pure: 'pure',
    purebasic: 'purebasic, pbfasm',
    purescript: 'purescript, purs',
    python: 'python, py',
    qsharp: 'qsharp, qs',
    q: 'q',
    qml: 'qml',
    qore: 'qore',
    r: 'r',
    racket: 'racket, rkt',
    cshtml: 'cshtml, razor',
    jsx: 'jsx',
    tsx: 'tsx',
    reason: 'reason',
    regex: 'regex',
    rego: 'rego',
    renpy: 'renpy, rpy',
    rescript: 'rescript, res',
    rest: 'rest',
    rip: 'rip',
    roboconf: 'roboconf',
    robotframework: 'robotframework, robot',
    ruby: 'ruby, rb',
    rust: 'rust',
    sas: 'sas',
    sass: 'sass',
    scss: 'scss',
    scala: 'scala',
    scheme: 'scheme',
    'shell-session': 'shell-session, sh-session, shellsession',
    smali: 'smali',
    smalltalk: 'smalltalk',
    smarty: 'smarty',
    sml: 'sml, smlnj',
    solidity: 'solidity, sol',
    'solution-file': 'solution-file, sln',
    soy: 'soy',
    sparql: 'sparql, rq',
    'splunk-spl': 'splunk-spl',
    sqf: 'sqf',
    sql: 'sql',
    squirrel: 'squirrel',
    stan: 'stan',
    stata: 'stata',
    iecst: 'iecst',
    stylus: 'stylus',
    supercollider: 'supercollider, sclang',
    swift: 'swift',
    systemd: 'systemd',
    't4-templating': 't4-templating',
    't4-cs': 't4-cs, t4',
    't4-vb': 't4-vb',
    tap: 'tap',
    tcl: 'tcl',
    tt2: 'tt2',
    textile: 'textile',
    toml: 'toml',
    tremor: 'tremor, trickle, troy',
    turtle: 'turtle, trig',
    twig: 'twig',
    typescript: 'typescript, ts',
    typoscript: 'typoscript, tsconfig',
    unrealscript: 'unrealscript, uscript, uc',
    uorazor: 'uorazor',
    uri: 'uri, url',
    v: 'v',
    vala: 'vala',
    vbnet: 'vbnet',
    velocity: 'velocity',
    verilog: 'verilog',
    vhdl: 'vhdl',
    vim: 'vim',
    'visual-basic': 'visual-basic, vb, vba',
    warpscript: 'warpscript',
    wasm: 'wasm',
    'web-idl': 'web-idl, webidl',
    wgsl: 'wgsl',
    wiki: 'wiki',
    wolfram: 'wolfram, mathematica, nb, wl',
    wren: 'wren',
    xeora: 'xeora, xeoracube',
    'xml-doc': 'xml-doc',
    xojo: 'xojo',
    xquery: 'xquery',
    yaml: 'yaml, yml',
    yang: 'yang',
    zig: 'zig'
  }

  for (const k of Object.keys(languages)) {
    const fileExtensions = languages[k].split(', ') || [languages[k]]

    for (const e of fileExtensions) {
      if (e === extension) {
        return k
      }
    }
  }

  return 'none'
}

// /* global ResizeObserver, MutationObserver */

// const stat = document.getElementById('status')
// const fileViewContent = document.querySelector('.file-view-content')
// const fileViewLineNumbers = document.querySelector('.file-view-lines')

// document.addEventListener('DOMContentLoaded', () => {
//   const textareaStyles = window.getComputedStyle(fileViewContent)
//   const mirroredStyles = [
//     'fontFamily',
//     'fontSize',
//     'fontWeight',
//     'letterSpacing',
//     'lineHeight',
//     'padding'
//   ]

//   mirroredStyles.forEach((property) => {
//     fileViewLineNumbers.style[property] = textareaStyles[property]
//   })

//   const parseValue = (v) => v.endsWith('px') ? parseInt(v.slice(0, -2), 10) : 0

//   const font = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`
//   const paddingLeft = parseValue(textareaStyles.paddingLeft)
//   const paddingRight = parseValue(textareaStyles.paddingRight)

//   const canvas = document.createElement('canvas')
//   const context = canvas.getContext('2d')

//   context.font = font

//   function calculateNumLines (str) {
//     const textareaWidth = fileViewContent.getBoundingClientRect().width - paddingLeft - paddingRight
//     const words = str.split(' ')

//     let lineCount = 0
//     let currentLine = ''

//     for (let i = 0; i < words.length; i++) {
//       const wordWidth = context.measureText(words[i] + ' ').width
//       const lineWidth = context.measureText(currentLine).width

//       if (lineWidth + wordWidth > textareaWidth) {
//         lineCount++
//         currentLine = words[i] + ' '
//       } else {
//         currentLine += words[i] + ' '
//       }
//     }

//     if (currentLine.trim() !== '') {
//       lineCount++
//     }

//     return lineCount
//   }

//   // https://phuoc.ng/collection/html-dom/count-how-many-lines-a-given-string-takes-up-in-a-text-area/
//   function calculateLineNumbers () {
//     const lines = fileViewContent.value.split('\n')
//     const numLines = lines.map((line) => calculateNumLines(line))

//     const lineNumbers = []
//     let i = 1

//     while (numLines.length > 0) {
//       const numLinesOfSentence = numLines.shift()
//       lineNumbers.push(i)

//       if (numLinesOfSentence > 1) {
//         Array(numLinesOfSentence - 1)
//           .fill('')
//           .forEach((_) => lineNumbers.push(''))
//       }

//       i++
//     }

//     return lineNumbers
//   }

//   // https://phuoc.ng/collection/mirror-a-text-area/display-the-line-numbers-in-a-text-area/
//   function displayLineNumbers () {
//     const lines = calculateLineNumbers()

//     fileViewLineNumbers.innerHTML = Array.from({
//       length: lines.length
//     }, (_, i) => `<div>${lines[i] || '&nbsp;'}</div>`).join('')

//     const lineNumbersWidth = context.measureText(' ' + lines.length + ' ').width

//     fileViewLineNumbers.style.minWidth = `calc(${lineNumbersWidth}px)`
//     fileViewContent.style.width = `calc(100% - ${lineNumbersWidth}px)`
//   }

//   fileViewContent.addEventListener('input', () => {
//     displayLineNumbers()
//   })

//   displayLineNumbers()

//   const ro = new ResizeObserver(() => {
//     const rect = fileViewContent.getBoundingClientRect()

//     fileViewLineNumbers.style.height = `${rect.height}px`

//     displayLineNumbers()
//   })

//   ro.observe(fileViewContent)

//   fileViewContent.addEventListener('scroll', () => {
//     displayLineNumbers()

//     fileViewLineNumbers.scrollTop = fileViewContent.scrollTop
//   })

//   // https://stackoverflow.com/a/58242354/7665043
//   const config = {
//     attributes: true,
//     childList: true,
//     subtree: true
//   }

//   const observer = new MutationObserver(displayLineNumbers)

//   observer.observe(fileViewContent, config)

//   loadFileFromLocationHREF()
// })

// function loadFileFromLocationHREF () {
//   const loc = window.location.href

//   if (loc.indexOf('?') === -1) {
//     throw new Error('No query in URL')
//   }

//   const query = loc.split('?')[1]

//   if (query.length === 0) {
//     throw new Error('No content in query')
//   }

//   const args = query.split('=')

//   if ((args.length % 2) !== 0) {
//     throw new Error('Malformed query')
//   }

//   const options = {}
//   const possibleOptions = [
//     'file'
//   ]

//   log(loc, query, args, typeof options)

//   for (let i = 0; i < args.length / 2; i += 2) {
//     if (possibleOptions.indexOf(args[i]) !== -1) {
//       options[args[i]] = args[i + 1]
//     }
//   }

//   if (options.file) {
//     loadFileViewContent(options.file)
//   }
// }

// function log (...value) {
//   if (value.length === 1) {
//     value = value[0]
//   }

//   const message = typeof value === 'object' && value.constructor.name === 'Array'
//     ? value.join('\n') // Separate lines for multiple-arg calls
//     : typeof value === 'object'
//       ? JSON.stringify(value)
//       : value

//   console.log(message)

//   if (stat.value !== '') {
//     stat.value += '\n'
//   }

//   stat.value += message
// }

// function loadFileViewContent (file) {
//   const data = typeof android !== 'undefined'
//     ? ''
//     : 'Some\nsimple\ntest data that can cause the textarea to be forced to\nwrap'

//   fileViewContent.textContent = data
// }
