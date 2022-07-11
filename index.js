const NAME = 'data_blocks'
const openName = `${NAME}_open`
const closeName = `${NAME}_close`

const optionsDefault = {
  titleLevel: 3,
  titleCb: (metadata) => metadata.title || '',
  tag: 'div',
  openMark: '-',
  closeMark: '.',
  markCount: 3,
  metadataParser: undefined,
  debug: false
}


const parseMetadata = (str, { metadataParser, debug }) => {
  try {
    if (typeof metadataParser !== 'function') throw new Error('metadata parser should be a function')
    const metadata = metadataParser(str)
    if (typeof metadata !== 'object') throw new Error('Metadata should be and object')
    return metadata
  } catch (err) {
    debug(err)
    return {}
  }
}


export const parseOptions = (userOptions = {}) => {
  const options = Object.assign({ ...optionsDefault }, userOptions)
  let { openMark, closeMark, markCount, debug } = options
  closeMark = closeMark || openMark
  const openMarkup = `${openMark}`.repeat(markCount)
  const closeMarkup = `${closeMark}`.repeat(markCount)
  debug = debug || function () { }
  if (debug && typeof debug !== 'function') debug = console.error
  return Object.assign(options, { openMarkup, closeMarkup, debug })
}


const addTitle = ({ state, title, titleLevel }) => {
  let token = state.push('heading_open', `h${titleLevel}`, 1)
  token.markup = '#'.repeat(titleLevel)
  token = state.push('inline', '', 0)
  token.content = `${title}`
  token.children = []
  token = state.push('heading_close', 'h3', -1)
  token.markup = '#'.repeat(titleLevel)
}

const renderDefault = (tokens, idx, _options, env, self) => {
  const token = tokens[idx]
  if (token.nesting === 1) {
    const { className } = token.meta || {}
    if (className) token.attrJoin('class', className)
  }
  return self.renderToken(tokens, idx, _options, env, self)
}


export const getOpenRegex = ({ openMarkup }) => new RegExp(`^${openMarkup}[a-z-|\\s]?([a-z-]*)[\\s]*$`, 'i')

export const getCloseRegex = ({ closeMarkup }) => new RegExp(`^${closeMarkup}\\s*$`)

export const getClassName = (openTag, { openMarkup }) => `${openTag}`.replace(`${openMarkup}`, '').trim().split(' ')[0].trim()

export default function metadata_blocks (md, options = {}) {
  options = parseOptions(options)
  const { titleLevel, titleCb, tag, openMarkup, closeMarkup } = options

  const render = options.render || renderDefault

  const openRegex = getOpenRegex(options)
  const closeRegex = getCloseRegex(options)

  md.block.ruler.before('table', NAME, (state, startLine, endLine, silent) => {

    state.env.meta = state.env.meta || options?.meta || {}

    const opener = state.getLines(startLine, startLine + 1, 0, false)

    if (!openRegex.test(opener) || (startLine !== 0 && !state.isEmpty(startLine - 1))) return false

    const nextLines = state.getLines(startLine + 1, endLine, 0, false).split('\n')
    const end = nextLines.findIndex(x => closeRegex.test(x))

    if (!end) return false

    let metadataEnd = nextLines.findIndex((x, i) => i > 0 && x === '')
    const metadata = parseMetadata(nextLines.slice(0, metadataEnd).join('\n'), options)

    if (!Object.keys(metadata).length) metadataEnd = 0
    const content = nextLines.slice(metadataEnd, end).join('\n')

    if (silent) return true // --- check where it should be

    metadata.className = getClassName(opener, options)
    const title = titleCb(metadata, content)

    let token = state.push(openName, tag, 1)
    token.meta = metadata
    token.markup = openMarkup
    token.content = content
    token.block = true
    token.map = [metadataEnd + 1, end + 1]

    // Add title
    if (title) addTitle({ state, title, titleLevel })

    state.md.block.tokenize(state, startLine + metadataEnd + 1, startLine + end + 1)

    token = state.push(closeName, tag, -1)
    token.markup = closeMarkup

    state.line = startLine + end + 2
    return true
  })

  md.renderer.rules[openName] = render
  md.renderer.rules[closeName] = render
}
