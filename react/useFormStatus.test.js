import { useRef, useEffect } from 'react'
import { act, renderHook } from '@testing-library/react-hooks'

import { useFormStatus } from './index'
import { createFormStore } from '../core'

const useWrapper = (store) => {
  const counterRef = useRef(0)

  useEffect(() => {
    counterRef.current++
  })

  const formStatus = useFormStatus(store)

  return {
    formStatus,
    counterRef,
  }
}

describe('useFormStatus', () => {
  test('returns form state', () => {
    const initialValues = { name: 'name', number: 123 }
    let { result } = renderHook(() =>
      useFormStatus(createFormStore({ initialValues }))
    )

    expect(result.current.dirtyFields).toEqual([])
    expect(result.current.errorFields).toEqual([])
    expect(result.current.isSubmitting).toBeFalsy()
    expect(result.current.isValidating).toBeFalsy()
    expect(result.current.isValid).toBeTruthy()
    expect(result.current.isDirty).toBeFalsy()
    expect(result.current.validatingFields).toEqual([])
  })

  test('updates values in the form and cause rerendering, if subscribed', async () => {
    const store = createFormStore({
      initialValues: { name: 'name', number: 123 },
      validate: (values) => ({
        name: values.name ? undefined : 'required',
      }),
    })
    let { result } = renderHook(() => useWrapper(store))

    expect(result.current.counterRef.current).toBe(1)
    expect(result.current.formStatus.isDirty).toBeFalsy()

    act(() => {
      store.update([['values', 'name', 'W']])
    })
    expect(result.current.formStatus.isDirty).toBeTruthy()
    expect(result.current.counterRef.current).toBe(2)

    act(() => {
      store.update([['values', 'name', 'Wi']])
    })
    expect(result.current.formStatus.isDirty).toBeTruthy()
    expect(result.current.counterRef.current).toBe(2)

    act(() => {
      store.update([['values', 'name', 'name']])
    })
    expect(result.current.counterRef.current).toBe(3)
    expect(result.current.formStatus.isDirty).toBeFalsy()
  })

  test('updates values in the form and does not cause rerendering, if not subscribed', () => {
    const store = createFormStore({
      initialValues: { name: 'name', number: 123 },
      validate: (values) => ({
        name: values.name ? undefined : 'required',
      }),
    })
    let { result } = renderHook(() => useWrapper(store))

    expect(store.getStatus().isValid).toBeTruthy()
    expect(result.current.counterRef.current).toBe(1)

    act(() => {
      store.update([['values', 'name', '']])
    })
    expect(store.getStatus().isValid).toBeFalsy()
    expect(result.current.counterRef.current).toBe(1)

    act(() => {
      store.update([['values', 'name', 'W']])
    })
    expect(store.getStatus().isValid).toBeTruthy()
    expect(store.getStatus().isDirty).toBeTruthy()
    expect(result.current.counterRef.current).toBe(1)
  })
})
