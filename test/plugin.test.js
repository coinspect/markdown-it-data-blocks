import { assert } from 'chai'
import MarkdownIt from 'markdown-it'
import { default as data_blocks, parseOptions, NAME } from '../index.js'

const options = parseOptions()

const { metadataBlockTypeName, openMarkup, closeMarkup } = options
const openName = `${NAME}_open`
const closeName = `${NAME}_close`
const metadataOpenName = `${NAME}_metadata_open`
const metadataCloseName = `${NAME}_metadata_close`

const tokenOrder = [openName, metadataOpenName, metadataCloseName, closeName]

describe('Test plugin without metadata', function () {
  const markdown = new MarkdownIt().use(data_blocks, options)
  const blockName = 'testName'
  const md = [' ', `${openMarkup} ${blockName}`, ' ', `${closeMarkup}`].join('\n')
  const result = markdown.parse(md)

  it('parsing result should be an array', () => {
    assert.isArray(result)
  })

  it('parsing result should have 4 tokens', () => {
    assert.equal(result.length, 4)
  })

  it(`The token order should be: ${tokenOrder}`, () => {
    assert.deepEqual(result.slice(0, 4).map(r => r.type), tokenOrder)
  })

  it(`The ${openName} token should have a meta property as object`, () => {
    assert.typeOf(result[0].meta, 'object')
  })

  it(`The block type should be included in meta`, () => {
    assert.equal(result[0].meta[metadataBlockTypeName], blockName)
  })
}) 