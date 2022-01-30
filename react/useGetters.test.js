import { useRef, useEffect } from 'react'
import { act, renderHook } from '@testing-library/react-hooks'

import { createFormStore } from '../core'

import { useGetters } from './useGetters'

let store

beforeEach(() => {
  store = createFormStore({ initialValues: { name: 'name', number: 123 } })
})

const useWrapper = (path, keys, st) => {
  const counterRef = useRef(0)

  useEffect(() => {
    counterRef.current++
  })

  return useGetters(
    {
      counterRef,
    },
    path,
    keys,
    st
  )
}

describe('useGetters', () => {
  it('returns correct key value', () => {
    let { result } = renderHook(() => useWrapper('', ['value'], store))

    const { value } = result.current

    expect(value).toEqual({ name: 'name', number: 123 })
    expect(result.current.counterRef.current).toBe(1)
  })

  it('returns correct key value after update', async () => {
    let { result } = renderHook(() => useWrapper('', ['value'], store))
    let { value } = result.current

    expect(value).toEqual({ name: 'name', number: 123 })
    expect(result.current.counterRef.current).toBe(1)

    act(() => store.update([['values', '', { name: 'Steve', number: 123 }]]))
    expect(result.current.value).toEqual({ name: 'Steve', number: 123 })
    expect(result.current.counterRef.current).toBe(2)
  })

  it('does not rerender if value was not read', () => {
    let { result } = renderHook(() => useWrapper('', ['value'], store))

    expect(result.current.counterRef.current).toBe(1)
    act(() => store.update([['values', '', { name: 'Steve', number: 123 }]]))
    expect(result.current.counterRef.current).toBe(1)
  })

  it('does not rerender if value was not changed', () => {
    let { result } = renderHook(() => useWrapper('', ['value'], store))

    expect(result.current.value).toEqual({ name: 'name', number: 123 })
    expect(result.current.counterRef.current).toBe(1)
    act(() => store.update([['errors', '', { name: 'Steve', number: 123 }]]))
    expect(result.current.counterRef.current).toBe(1)
  })

  it('does not rerender if value was updated to the same value', () => {
    let { result } = renderHook(() => useWrapper('', ['value'], store))

    expect(result.current.value).toEqual({ name: 'name', number: 123 })
    expect(result.current.counterRef.current).toBe(1)

    act(() => store.update([['values', '', 'value']]))
    expect(result.current.counterRef.current).toBe(2)

    act(() => store.update([['values', '', 'value']]))
    expect(result.current.counterRef.current).toBe(2)
  })
})
