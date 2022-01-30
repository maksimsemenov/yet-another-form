import { set } from './set'

describe('set', () => {
  describe('object', () => {
    it('sets value in the object', () => {
      const obj1 = { first: 'first' }
      const obj2 = set(obj1, 'second', 'second')

      expect(obj1).toEqual({ first: 'first' })
      expect(obj2).not.toBe(obj1)
      expect(obj2).toEqual({ first: 'first', second: 'second' })
    })

    it('sets nested value in the object', () => {
      const obj1 = { first: 'first' }
      const obj2 = set(obj1, 'second.nested', 'second')

      expect(obj1).toEqual({ first: 'first' })
      expect(obj2).not.toBe(obj1)
      expect(obj2).toEqual({ first: 'first', second: { nested: 'second' } })
    })

    it('consequently sets the same nested value', () => {
      const obj1 = { first: 'first' }
      const obj2 = set(obj1, 'second.nested', 'second')
      const obj3 = set(obj2, 'second.nested', 'third')

      expect(obj1).toEqual({ first: 'first' })
      expect(obj2).not.toBe(obj1)
      expect(obj2).toEqual({ first: 'first', second: { nested: 'second' } })
      expect(obj3).not.toBe(obj2)
      expect(obj3).toEqual({ first: 'first', second: { nested: 'third' } })
    })

    it('does not modify not related state', () => {
      const obj1 = { first: { nested: 'first' } }
      const obj2 = set(obj1, 'second.nested', 'second')

      expect(obj1).toEqual({ first: { nested: 'first' } })
      expect(obj2).not.toBe(obj1)
      expect(obj2.first).toBe(obj1.first)
      expect(obj2).toEqual({
        first: { nested: 'first' },
        second: { nested: 'second' },
      })
    })

    it('sets value in the nested array field', () => {
      const obj1 = { first: [20, 30, 40] }
      const obj2 = set(obj1, 'first.1', 50)

      expect(obj1).toEqual({ first: [20, 30, 40] })
      expect(obj2).not.toBe(obj1)
      expect(obj2).toEqual({ first: [20, 50, 40] })
    })

    it('transforms object into array, if numeric path is provided', () => {
      const obj = { first: 'first' }
      const arr = set(obj, '2', 'second')

      expect(obj).toEqual({ first: 'first' })
      expect(arr).not.toBe(obj)
      expect(arr).toEqual([undefined, undefined, 'second'])
    })
  })

  describe('array', () => {
    it('sets value in the array', () => {
      const arr1 = [20, 30, 40]
      const arr2 = set(arr1, '1', 50)

      expect(arr1).toEqual([20, 30, 40])
      expect(arr2).not.toBe(arr1)
      expect(arr2).toEqual([20, 50, 40])
    })

    it('sets nested value in the array', () => {
      const arr1 = [{ first: 'first' }]
      const arr2 = set(arr1, '0.second', 'second')

      expect(arr1).toEqual([{ first: 'first' }])
      expect(arr2).not.toBe(arr1)
      expect(arr2).toEqual([{ first: 'first', second: 'second' }])
    })

    it('does not modify not related state', () => {
      const arr1 = [
        { first: 'first' },
        { second: 'second' },
        { third: 'third' },
      ]
      const arr2 = set(arr1, '1.second', 'value')

      expect(arr1).toEqual([
        { first: 'first' },
        { second: 'second' },
        { third: 'third' },
      ])
      expect(arr2).not.toBe(arr1)
      expect(arr2[0]).toBe(arr1[0])
      expect(arr2[1]).not.toBe(arr1[1])
      expect(arr2[2]).toBe(arr1[2])
      expect(arr2).toEqual([
        { first: 'first' },
        { second: 'value' },
        { third: 'third' },
      ])
    })

    it('transforms array into object, if string path is provided', () => {
      const arr = [{ first: 'first' }]
      const obj = set(arr, 'second', 'second')

      expect(arr).toEqual([{ first: 'first' }])
      expect(obj).not.toBe(arr)
      expect(obj).toEqual({ second: 'second' })
    })
  })

  describe('deep', () => {
    it('sets a deeply nested value', () => {
      const obj1 = { first: 'first' }
      const obj2 = set(obj1, 'second[2][0].name', 'name')

      expect(obj1).toEqual({ first: 'first' })
      expect(obj2).not.toBe(obj1)
      expect(obj2).toEqual({
        first: 'first',
        second: [undefined, undefined, [{ name: 'name' }]],
      })
    })
  })

  describe('falsy', () => {
    it('sets value if null provided as a target', () => {
      expect(set(null, 'prop', 'value')).toEqual({ prop: 'value' })
    })

    it('sets value if null provided as a target and path is a number', () => {
      expect(set(null, '2', 'value')).toEqual([undefined, undefined, 'value'])
    })

    it('sets value if undefined provided as a target', () => {
      expect(set(undefined, 'prop', 'value')).toEqual({ prop: 'value' })
    })

    it('sets value if undefined provided as a target and path is a number', () => {
      expect(set(undefined, '2', 'value')).toEqual([
        undefined,
        undefined,
        'value',
      ])
    })
  })
})
