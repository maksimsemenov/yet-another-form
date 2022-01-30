import { nestedPathRegExp, normalizePath } from './path'

describe('nestedPathRegExp', () => {
  it('detects netsed path', () => {
    expect(nestedPathRegExp.test('item.title')).toBeTruthy()
    expect(nestedPathRegExp.test('items[0]')).toBeTruthy()
  })
  it('does not detect non-netsed path', () => {
    expect(nestedPathRegExp.test('item')).toBeFalsy()
  })
})

describe('normalizePath', () => {
  it('normalizes path with array indexes', () => {
    expect(normalizePath('items[0].title')).toBe('items.0.title')
  })

  it('leaves path without array index as is', () => {
    expect(normalizePath('items.0.title')).toBe('items.0.title')
  })
})
