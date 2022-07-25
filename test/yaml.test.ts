import { assert } from 'chai'
import MarkdownIt from 'markdown-it'
import yaml from 'yaml'
import { default as data_blocks, parseOptions } from '../index'


const metadataParser = (str: string, data: any) => yaml.parse(str)
const options = parseOptions({ metadataParser })

const { metadataBlockTypeName, openMarkup, closeMarkup } = options

const metadata = {
  a: 1,
  "test": {
    b: 2,
    c: 3
  }
}

describe('Parse YAML metadata', function () {
  const markdown = new MarkdownIt().use(data_blocks, options)
  const blockName = 'testName'
  const md = [' ', `${openMarkup} ${blockName}`, yaml.stringify(metadata), ' ', `${closeMarkup}`].join('\n')
  const [token] = markdown.parse(md, {})

  it('token.meta should be an object', () => {
    assert.typeOf(token.meta, 'object')
  })

  it(`token.meta should contain the block name in a "${metadataBlockTypeName}" property`, () => {
    assert.equal(token.meta[metadataBlockTypeName], blockName)
  })

  it('token.meta should have all the metadata properties', () => {
    for (let p in metadata) {
      assert.deepEqual(metadata[p as keyof typeof metadata], token.meta[p])
    }
  })
})
