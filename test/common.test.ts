import { getOpenRegex, getCloseRegex, parseOptions, getBlockType } from '../index'

const defaultOptions = parseOptions()


describe('parseOptions', () => {
  it('default options should be an object', () => {
    expect(typeof defaultOptions).toBe('object')
  })
})

describe('openRegex', () => {
  const { openMarkup } = defaultOptions
  const re = getOpenRegex(defaultOptions)
  it(`openRegex should match the openMarkup: ${openMarkup}`, () => {
    expect(re.test(openMarkup)).toBe(true)
  })

  it(`ending spaces should be ignored`, () => {
    expect(re.test(`${openMarkup}   `)).toBe(true)
  })

  it(`openMarkup should admit only one word`, () => {
    expect(re.test(`${openMarkup} tesT`)).toBe(true)
    expect(re.test(`${openMarkup} Test    `)).toBe(true)
    expect(re.test(`${openMarkup}test`)).toBe(true)
    expect(re.test(`${openMarkup}-test`)).toBe(true)
    expect(re.test(`${openMarkup} test Test`)).toBe(false)
  })
})


describe('closeRegex', () => {
  const { closeMarkup } = defaultOptions
  const re = getCloseRegex(defaultOptions)
  it(`closeRegex should match the closeMarkup: ${closeMarkup}`, () => {
    expect(re.test(closeMarkup)).toBe(true)
  })

  it(`ending spaces should be ignored`, () => {
    expect(re.test(`${closeMarkup}   `)).toBe(true)
  })
})

describe('getBlockType', () => {
  const { openMarkup } = defaultOptions
  const name = 'tEsT-test'
  it('getBlockType should return the block type', () => {
    expect(getBlockType(`${openMarkup}`, defaultOptions)).toEqual('')
    expect(getBlockType(`${openMarkup}${name}`, defaultOptions)).toEqual(name)
    expect(getBlockType(`${openMarkup} ${name}`, defaultOptions)).toEqual(name)
    expect(getBlockType(`${openMarkup}    ${name}       `, defaultOptions)).toEqual(name)
    expect(getBlockType(`${openMarkup}    ${name} xxX      `, defaultOptions)).toEqual(name)
  })
})
