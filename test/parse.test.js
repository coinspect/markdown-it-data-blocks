import { getOpenRegex, getCloseRegex, parseOptions, getClassName } from '../index.js'
import { assert } from 'chai'

const defaultOptions = parseOptions()


describe('parseOptions', function () {
  it('default options should be an object', () => {
    assert.typeOf(defaultOptions, 'object')
  })
})

describe('openRegex', function () {
  const { openMarkup } = defaultOptions
  const re = getOpenRegex(defaultOptions)
  it(`openRegex should match the openMarkup: ${openMarkup}`, () => {
    assert.isTrue(re.test(openMarkup))
  })

  it(`ending spaces should be ignored`, () => {
    assert.isTrue(re.test(`${openMarkup}   `))
  })

  it(`openMarkup should admit only one word`, () => {
    assert.isTrue(re.test(`${openMarkup} tesT`))
    assert.isTrue(re.test(`${openMarkup} Test    `))
    assert.isTrue(re.test(`${openMarkup}test`))
    assert.isTrue(re.test(`${openMarkup}-test`))
    assert.isFalse(re.test(`${openMarkup} test Test`))
  })
})


describe('closeRegex', function () {
  const { closeMarkup } = defaultOptions
  const re = getCloseRegex(defaultOptions)
  it(`closeRegex should match the closeMarkup: ${closeMarkup}`, () => {
    assert.isTrue(re.test(closeMarkup))
  })

  it(`ending spaces should be ignored`, () => {
    assert.isTrue(re.test(`${closeMarkup}   `))
  })
})

describe('getClassName', function () {
  const { openMarkup } = defaultOptions
  const name = 'tEsT-test'
  it('getClassName should return className', () => {
    assert.equal(getClassName(`${openMarkup}`, defaultOptions), '')
    assert.equal(getClassName(`${openMarkup}${name}`, defaultOptions), name)
    assert.equal(getClassName(`${openMarkup} ${name}`, defaultOptions), name)
    assert.equal(getClassName(`${openMarkup}    ${name}       `, defaultOptions), name)
    assert.equal(getClassName(`${openMarkup}    ${name} xxX      `, defaultOptions), name)
  })
})