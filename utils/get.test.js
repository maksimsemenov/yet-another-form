import { get } from './get'

describe('get', () => {
  describe('invalid input', () => {
    it('should return undefined when state is undefined', () => {
      expect(get(undefined, 'whatever')).toBeUndefined()
    })
    it('should return undefined when state is null', () => {
      expect(get(null, 'whatever')).toBeUndefined()
    })
    it('should return undefined when state is boolean', () => {
      expect(get(false, 'whatever')).toBeUndefined()
      expect(get(true, 'whatever')).toBeUndefined()
    })
    it('should return undefined when state is number', () => {
      expect(get(0, 'whatever')).toBeUndefined()
      expect(get(42, 'whatever')).toBeUndefined()
      expect(get(69, 'whatever')).toBeUndefined()
    })
    it('should return undefined when state is string', () => {
      expect(get('Not an array or object', 'whatever')).toBeUndefined()
      expect(get('', 'whatever')).toBeUndefined()
    })
  })

  it('should get simple object keys', () => {
    expect(get({ foo: 'bar' }, 'foo')).toBe('bar')
    expect(get({ life: 42 }, 'life')).toBe(42)
    expect(get({ awesome: true }, 'awesome')).toBe(true)
  })

  it('should get simple array indexes', () => {
    expect(get({ myArray: ['a', 'b', 'c'] }, 'myArray[0]')).toBe('a')
    expect(get({ myArray: ['a', 'b', 'c'] }, 'myArray[1]')).toBe('b')
    expect(get({ myArray: ['a', 'b', 'c'] }, 'myArray[2]')).toBe('c')
  })

  it('should get simple array indexes of numbers', () => {
    expect(get({ myArray: [1] }, 'myArray[0]')).toBe(1)
    expect(get({ myArray: [1, 2, 3] }, 'myArray[1]')).toBe(2)
    expect(get({ myArray: [1, 2, 3] }, 'myArray[2]')).toBe(3)
  })

  it('should return undefined for non-numeric key to an array', () => {
    expect(get({ myArray: ['a', 'b', 'c'] }, 'myArray.foo')).toBeUndefined()
  })

  it('should get arbitrarily deep values', () => {
    expect(get({ a: [{ b: 2 }] }, 'a[0].b')).toBe(2)
    expect(get({ a: ['first', [{ b: 'c' }]] }, 'a[1][0].b')).toBe('c')
  })

  it('returns value from the object', () => {
    const obj = { first: 'first' }
    expect(get(obj, 'first')).toBe('first')
  })

  it('returns undefined value from the object for undefined path', () => {
    const obj = { first: 'first' }
    expect(get(obj, 'second')).toBeUndefined()
  })

  it('returns value from the object for nested path', () => {
    const obj = { first: { nested: { object: { value: 'value' } } } }
    expect(get(obj, 'first.nested.object.value')).toBe('value')
  })

  it('returns undefined value from the object for undefined nested path', () => {
    const obj = { first: { nested: { object: null } } }
    expect(get(obj, 'first.nested.object.value')).toBeUndefined()
  })

  it('returns undefined value from the object for undefined nested path', () => {
    const obj = { first: { nested: { object: null } } }
    expect(get(obj, 'first.nested.object.value')).toBeUndefined()
  })

  it('returns falsy value from the object for nested path', () => {
    const obj = { first: { nested: { string: '' } } }
    expect(get(obj, 'first.nested.string')).toBe('')
  })

  it('returns value from the array', () => {
    const arr = ['first', 'second']
    expect(get(arr, '1')).toBe('second')
  })

  it('returns nested value from the array', () => {
    const arr = [{ name: 'first' }, { name: 'second' }]
    expect(get(arr, '1.name')).toBe('second')
  })

  it('returns undefined nested value from the array', () => {
    const arr = ['first', 'second']
    expect(get(arr, '2')).toBeUndefined()
  })

  it('returns undefined nested value from the array', () => {
    const arr = [{ name: 'first' }, { name: 'second' }]
    expect(get(arr, '2.name')).toBeUndefined()
  })

  it('returns undefined nested value from the complex object', () => {
    const obj = {
      first: { array: [{ nested: [{ id: 'id1' }, { id: 'id2' }] }] },
    }
    expect(get(obj, 'first.array[0].nested[1].id')).toBe('id2')
  })

  it('returns undefined nested value from the complex object', () => {
    const obj = {
      first: { array: [{ nested: [{ id: 'id1' }, { id: 'id2' }] }] },
    }
    expect(get(obj, 'first.array.seond.nested[1].id')).toBeUndefined()
  })

  it('returns source itself, if path is falsy', () => {
    const obj = {
      first: { array: [{ nested: [{ id: 'id1' }, { id: 'id2' }] }] },
    }
    expect(get(obj, '')).toBe(obj)
  })
})
