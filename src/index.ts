import MarkdownIt from 'markdown-it'
import Renderer from 'markdown-it/lib/renderer'
import StateBlock from 'markdown-it/lib/rules_block/state_block'
export const NAME = 'data_blocks'
const openName = `${NAME}_open`
const closeName = `${NAME}_close`

const openMetadataName = `${NAME}_metadata_open`
const closeMetadataName = `${NAME}_metadata_close`

type CustomOptions = {
  titleLevel: number
  titleCb: (metadata: { title: string }, content?: string) => string
  metadataBlockTypeName: string
  tag: string
  openMarkup: string
  closeMarkup: string
  metadataParser: ((str: string, data: any) => object) | undefined
  metadataRenderer: Renderer.RenderRule
  debug: boolean | ((...data: any[]) => void)
}
const optionsDefault: CustomOptions = {
  titleLevel: 3,
  titleCb: (metadata: { title: string }) => metadata.title || '',
  metadataBlockTypeName: 'type',
  tag: 'div',
  openMarkup: '---',
  closeMarkup: '/--',
  metadataParser: undefined,
  metadataRenderer: () => '', // don't render metadata as default
  debug: false
}

const parseMetadata = (
  str: string,
  { metadataParser, debug }: any,
  data = {}
) => {
  try {
    if (typeof metadataParser !== 'function') {
      throw new Error('metadata parser should be a function')
    }
    const metadata = metadataParser(str, data)
    if (typeof metadata !== 'object') {
      throw new Error('Metadata should be and object')
    }
    return metadata
  } catch (err) {
    if (debug) {
      debug(err)
    }
    return
  }
}

export const parseOptions: (
  userOptions?: MarkdownIt.Options & {
    metadataParser?: (str: string, data: any) => any
  }
) => CustomOptions = (userOptions = {}) => {
  const options = Object.assign({ ...optionsDefault }, userOptions)
  let { debug, openMarkup, closeMarkup } = options
  closeMarkup = closeMarkup || openMarkup
  if (debug && typeof debug !== 'function') {
    debug = console.error
  }
  return Object.assign(options, { openMarkup, closeMarkup, debug })
}

const addTitle = ({
  state,
  title,
  titleLevel
}: {
  state: StateBlock
  title: string
  titleLevel: number
}) => {
  let token = state.push('heading_open', `h${titleLevel}`, 1)
  token.markup = '#'.repeat(titleLevel)
  token = state.push('inline', '', 0)
  token.content = `${title}`
  token.children = []
  token = state.push('heading_close', 'h3', -1)
  token.markup = '#'.repeat(titleLevel)
}

const addMetadata = ({
  state,
  metadata
}: {
  state: StateBlock
  metadata: object
}) => {
  let token = state.push(openMetadataName, 'div', 1)
  token.meta = metadata
  token = state.push(closeMetadataName, 'div', -1)
}

const renderDefault: (options: CustomOptions) => Renderer.RenderRule =
  ({ metadataBlockTypeName }) =>
  (tokens, idx, _options, self) => {
    const token = tokens[idx]
    if (token.nesting === 1) {
      const metadata = token.meta || {}
      const className = metadata[metadataBlockTypeName]
      if (className) {
        token.attrJoin('class', className)
      }
    }
    return self.renderToken(tokens, idx, _options)
  }

export const getOpenRegex = ({ openMarkup }: { openMarkup: string }) =>
  new RegExp(`^${openMarkup}[a-z-|\\s]?([a-z-]*)[\\s]*$`, 'i')

export const getCloseRegex = ({ closeMarkup }: { closeMarkup: string }) =>
  new RegExp(`^${closeMarkup}\\s*$`)

export const getBlockType = (openTag: string, { openMarkup }: CustomOptions) =>
  `${openTag}`.replace(`${openMarkup}`, '').trim().split(' ')[0].trim()

const insertBlock = ({
  state,
  startLine,
  metadata,
  content,
  tokenStart,
  tokenEnd,
  options
}: {
  state: StateBlock
  startLine: number
  metadata: { title: string }
  tokenStart: number
  content: string
  tokenEnd: number
  options: CustomOptions
}) => {
  const { openMarkup, closeMarkup, tag, titleCb, titleLevel } = options
  const title =
    typeof titleCb === 'function' ? titleCb(metadata, content) : undefined

  let token = state.push(openName, tag, 1)
  token.meta = metadata
  token.markup = openMarkup
  token.content = content
  token.block = true
  token.map = [tokenStart, tokenEnd]

  // Add title
  if (title) {
    addTitle({ state, title, titleLevel })
  }

  // Add metadata block (to render)
  // Here I had a typing issue,
  // addMetadata puts the parameter in token.content which is typed as a string.
  // Hacked at it but I didn't have any idea of what I did
  addMetadata({ state, metadata })

  state.md.block.tokenize(state, startLine + tokenStart, startLine + tokenEnd)

  token = state.push(closeName, tag, -1)
  token.markup = closeMarkup

  state.line = startLine + tokenEnd + 1
}

export const parseBlock = ({
  state,
  startLine,
  endLine,
  silent,
  options
}: {
  state: StateBlock
  startLine: number
  endLine: number
  silent: boolean
  options: CustomOptions
}) => {
  const { metadataBlockTypeName } = options
  const openRegex = getOpenRegex(options)
  const closeRegex = getCloseRegex(options)

  const opener = state.getLines(startLine, startLine + 1, 0, false)

  if (
    !openRegex.test(opener) ||
    (startLine !== 0 && !state.isEmpty(startLine - 1))
  ) {
    return false
  }

  const nextLines = state.getLines(startLine + 1, endLine, 0, false).split('\n')
  const end = nextLines.findIndex((x: string) => closeRegex.test(x))

  if (!end) {
    return false
  }

  const blockType = getBlockType(opener, options)

  let metadataEnd = nextLines.findIndex(
    (x: string, i: number) => i > 0 && x === ''
  )
  let metadata = parseMetadata(
    nextLines
      .slice(0, metadataEnd)
      .filter((x: any) => x)
      .join('\n'),
    options,
    { blockType }
  )

  if (typeof metadata !== 'object') {
    metadata = {}
  }
  if (!Object.keys(metadata).length) {
    metadataEnd = 0
  }

  const content = nextLines.slice(metadataEnd, end).join('\n')

  if (silent) {
    return true
  } // --- check where it should be

  if (metadataBlockTypeName) {
    metadata[`${metadataBlockTypeName}`] = blockType
  }
  insertBlock({
    state,
    startLine,
    metadata,
    content,
    tokenStart: metadataEnd + 1,
    tokenEnd: end + 1,
    options
  })
  return true
}
/* eslint-disable @typescript-eslint/naming-convention */
export default function metadata_blocks(
  md: MarkdownIt,
  options: MarkdownIt.Options & { render?: Renderer.RenderRule } = {}
) {
  const customOptions = parseOptions(options)
  const render = options.render || renderDefault(customOptions)
  const { metadataRenderer } = customOptions

  md.block.ruler.before('table', NAME, (state, startLine, endLine, silent) => {
    return parseBlock({
      state,
      startLine,
      endLine,
      silent,
      options: customOptions
    })
  })

  md.renderer.rules[openName] = render
  md.renderer.rules[closeName] = render
  md.renderer.rules[openMetadataName] = metadataRenderer
  md.renderer.rules[closeMetadataName] = metadataRenderer
}
