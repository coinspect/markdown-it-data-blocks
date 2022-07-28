import MarkdownIt from 'markdown-it'
import yaml from 'yaml'
import { default as data_blocks, parseOptions } from '../index'

const metadataParser = (str: string, data: any) => yaml.parse(str)
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
