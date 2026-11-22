import { jest } from '@jest/globals'
import { memoise } from './memoise'

describe('memoise', () => {
  it('calls the function once per argument', () => {
    const fn = jest.fn((value) => `${value}!`)
    const memoised = memoise(fn)

    expect(memoised('a')).toBe('a!')
    expect(memoised('a')).toBe('a!')
    expect(memoised('b')).toBe('b!')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('caches falsy results', () => {
    const fn = jest.fn(() => undefined)
    const memoised = memoise(fn)
    memoised('a')
    memoised('a')

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
