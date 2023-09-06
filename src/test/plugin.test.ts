import MarkdownIt from 'markdown-it'
import {
  default as data_blocks,
  parseOptions,
  openName,
  closeName,
  openMetadataName,
  closeMetadataName
} from '../index'

const options = parseOptions()

const { metadataBlockTypeName, openMarkup, closeMarkup } = options

const tokenOrder = [
  openName,
  openMetadataName,
  closeMetadataName,
  'paragraph_open',
  'inline',
  'paragraph_close',
  closeName
]

const tokensLen = tokenOrder.length

describe('Test plugin without metadata', () => {
  const markdown = new MarkdownIt().use(data_blocks, options)
  const blockName = 'testName'
  const content = 'Test content'
  const md = [
    ' ',
    `${openMarkup} ${blockName}`,
    content,
    `${closeMarkup}`
  ].join('\n')
  const result = markdown.parse(md, {})

  it('parsing result should be an array', () => {
    expect(Array.isArray(result)).toBe(true)
  })

  it(`parsing result should have ${tokensLen} tokens`, () => {
    expect(result.length).toEqual(tokensLen)
  })

  it(`The token order should be: ${tokenOrder}`, () => {
    expect(result.slice(0, tokensLen).map((r) => r.type)).toEqual(tokenOrder)
  })

  it(`The ${openName} token should have a meta property as object`, () => {
    expect(typeof result[0].meta).toBe('object')
  })

  it('The block type should be included in meta', () => {
    expect(result[0].meta[metadataBlockTypeName]).toEqual(blockName)
  })

  it('The token content should have the content', () => {
    expect(result[0].content).toBe(content)
  })

  it('The consecutive blocks should be parsed', () => {
    const md = [
      `${openMarkup} ${blockName}`,
      content,
      `${closeMarkup}`,
      `${openMarkup} ${blockName}`,
      content + 2,
      `${closeMarkup}`
    ].join('\n')
    const tokens = markdown.parse(md, {})
    expect(tokens.filter(({ type }) => type === openName).length).toBe(2)
    expect(tokens.filter(({ type }) => type === closeName).length).toBe(2)
  })
})
