import MarkdownIt from 'markdown-it'
import yaml from 'yaml'
import { default as data_blocks, parseOptions } from '../index'
import {
  openName,
  closeName,
  metadataOpenName,
  metadataCloseName
} from './test.helpers'

const metadataParser = (str: string, data: any) => yaml.parse(str)
const metadataToMd = (metadata: {}): string => yaml.stringify(metadata)
const options = parseOptions({ metadataParser })

const { metadataBlockTypeName, openMarkup, closeMarkup } = options

const metadata = {
  a: 1,
  test: {
    b: 2,
    c: 3
  }
}

describe('Parse YAML metadata', () => {
  const markdown = new MarkdownIt().use(data_blocks, options)
  const blockName = 'testName'
  const md = [
    ' ',
    `${openMarkup} ${blockName}`,
    yaml.stringify(metadata),
    ' ',
    `${closeMarkup}`
  ].join('\n')
  const [token] = markdown.parse(md, {})

  it('token.meta should be an object', () => {
    expect(typeof token.meta).toBe('object')
  })

  it(`token.meta should contain the block name in a "${metadataBlockTypeName}" property`, () => {
    expect(token.meta[metadataBlockTypeName]).toEqual(blockName)
  })

  it('token.meta should have all the metadata properties', () => {
    for (let p in metadata) {
      expect(metadata[p as keyof typeof metadata]).toEqual(token.meta[p])
    }
  })
})

describe('Test metadada', () => {
  const markdown = new MarkdownIt().use(data_blocks, {
    ...options,
    metadataParser
  })
  const title = 'Test title'
  const subtitle = 'Subtitle'
  const metadata = { title }
  const blockName = 'block'
  const content = 'Some text'
  const blockContent = [content, `#### ${subtitle}`, 'Test paragraph']
  const md = [
    ' ',
    `${openMarkup} ${blockName}`,
    metadataToMd(metadata),
    ...blockContent,
    `${closeMarkup}`
  ].join('\n')
  const tokens = markdown.parse(md, {})

  it('should add metadata to token', () => {
    const token = tokens[0]
    expect(token.meta).toStrictEqual({ title, type: blockName })
  })

  it('should create a heading token for metadata title', () => {
    const openTokenIndex = tokens.findIndex(({ type }) => type === openName)
    const headingToken = tokens[openTokenIndex + 1]
    expect(headingToken.type).toBe('heading_open')
    expect(headingToken.markup).toBe('#'.repeat(options.titleLevel))
    const titleTokens = tokens.slice(
      openTokenIndex + 2,
      tokens.findIndex(({ type }) => type === 'heading_close')
    )
    expect(titleTokens.map(({ content }) => content).join('')).toBe(title)
  })

  describe('wrapOnly option', () => {
    const wrapParser = new MarkdownIt().use(data_blocks, {
      ...options,
      wrapOnly: true
    })

    const tokens = wrapParser.parse(md, {})
    const test = markdown.parse(md, {})
    const searchHeadings = (tokens: any[]) =>
      tokens.filter((t) => t.type === 'heading_open')

    it('options.wrapOnly should wrap headers', () => {
      expect(tokens[0].type).toBe(openName)
      expect(tokens[0].content.split('\n')).toStrictEqual(['', ...blockContent])
      expect(tokens[tokens.length - 1].type).toBe(closeName)
    })

    it('options.wrapOnly should skip adding the title token', () => {
      expect(searchHeadings(tokens).length).toBe(1)
      expect(searchHeadings(test).length).toBe(2)
    })
  })
})
