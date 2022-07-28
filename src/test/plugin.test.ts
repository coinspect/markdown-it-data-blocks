import MarkdownIt from 'markdown-it'
import { default as data_blocks, parseOptions, NAME } from '../index'

const options = parseOptions()

const { metadataBlockTypeName, openMarkup, closeMarkup } = options
const openName = `${NAME}_open`
const closeName = `${NAME}_close`
const metadataOpenName = `${NAME}_metadata_open`
const metadataCloseName = `${NAME}_metadata_close`

const tokenOrder = [openName, metadataOpenName, metadataCloseName, closeName]

describe('Test plugin without metadata', () => {
  const markdown = new MarkdownIt().use(data_blocks, options)
  const blockName = 'testName'
  const md = [' ', `${openMarkup} ${blockName}`, ' ', `${closeMarkup}`].join(
    '\n'
  )
  const result = markdown.parse(md, {})

  it('parsing result should be an array', () => {
    expect(Array.isArray(result)).toBe(true)
  })

  it('parsing result should have 4 tokens', () => {
    expect(result.length).toEqual(4)
  })

  it(`The token order should be: ${tokenOrder}`, () => {
    expect(result.slice(0, 4).map((r) => r.type)).toEqual(tokenOrder)
  })

  it(`The ${openName} token should have a meta property as object`, () => {
    expect(typeof result[0].meta).toBe('object')
  })

  it(`The block type should be included in meta`, () => {
    expect(result[0].meta[metadataBlockTypeName]).toEqual(blockName)
  })
})
