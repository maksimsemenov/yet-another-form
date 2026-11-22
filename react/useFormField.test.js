import { jest } from '@jest/globals'
import { act, renderHook } from '@testing-library/react-hooks'

import { useFormField } from './index'
import { createFormStore } from '../core'

import { createEvent } from '../test/utils'

describe('useFormField', () => {
  test('throws an error, if used outside form context', () => {
    const { result } = renderHook(() => useFormField('name'))
    expect(result.error.message).toBe(
      'Could not find form context. Please ensure the component is wrapped in a <Form> or formContext is passed as a hook param'
    )
  })
  test('returns field state', () => {
    const formState = createFormStore({ initialValues: { name: 'Mike' } })
    let { result } = renderHook(() =>
      useFormField('name', { formContext: formState })
    )

    expect(typeof result.current.setValue).toBe('function')
    expect(typeof result.current.setError).toBe('function')
    expect(typeof result.current.setTouched).toBe('function')

    expect(result.current.value).toBe('Mike')
    expect(result.current.error).toBeUndefined()
    expect(result.current.touched).toBeFalsy()
    expect(result.current.isDirty).toBeFalsy()
    expect(result.current.isValidating).toBeFalsy()
  })

  describe('setters', () => {
    test('keeps function references between re-renders', () => {
      const formState = createFormStore({ initialValues: { name: 'Mike' } })
      let { result, rerender } = renderHook(() =>
        useFormField('name', { formContext: formState })
      )

      const setValue = result.current.setValue
      const setError = result.current.setError
      const setTouched = result.current.setTouched

      rerender()

      expect(result.current.setValue).toBe(setValue)
      expect(result.current.setTouched).toBe(setTouched)
      expect(result.current.setError).toBe(setError)
    })

    describe('setValues', () => {
      test('it updates value when called with event', () => {
        const formState = createFormStore({ initialValues: { name: 'Mike' } })
        let { result } = renderHook(() =>
          useFormField('name', { formContext: formState })
        )
        const event = createEvent('change', { name: 'name', value: 'W' })

        act(() => {
          result.current.setValue(event)
        })
        expect(result.current.value).toEqual('W')
      })

      test('it updates value when called with new value', () => {
        const formState = createFormStore({ initialValues: { name: 'Mike' } })
        let { result } = renderHook(() =>
          useFormField('name', { formContext: formState })
        )
        act(() => {
          result.current.setValue('W')
        })
        expect(result.current.value).toEqual('W')
      })
    })

    describe('setError', () => {
      test('it updates field error when called with error', () => {
        const formState = createFormStore({
          initialValues: { name: 'Mike' },
          debounce: 0,
        })
        let { result } = renderHook(() =>
          useFormField('name', { formContext: formState })
        )

        expect(result.current.error).toBeUndefined()
        act(() => {
          result.current.setError('test error')
        })

        expect(result.current.error).toBe('test error')
        expect(result.current.isValid).toBeFalsy()
      })
    })

    describe('setTouched', () => {
      test('it updates touched value when called with event', () => {
        const formState = createFormStore({ initialValues: { name: 'Mike' } })
        let { result } = renderHook(() =>
          useFormField('name', { formContext: formState })
        )

        expect(result.current.touched).toBeFalsy()

        act(() => {
          result.current.setTouched({ target: { name: 'name', value: 'W' } })
        })
        expect(result.current.touched).toBeTruthy()
      })

      test('it updates touched value when called with new touched value', () => {
        const formState = createFormStore({ initialValues: { name: 'Mike' } })
        let { result } = renderHook(() =>
          useFormField('name', { formContext: formState })
        )

        expect(result.current.touched).toBeFalsy()

        act(() => {
          result.current.setTouched(true)
        })
        expect(result.current.touched).toBeTruthy()

        act(() => {
          result.current.setTouched(false)
        })
        expect(result.current.touched).toBeFalsy()
      })
    })
  })

  describe('validation', () => {
    test('runs field validation, when field is changed', () => {
      const formState = createFormStore({
        initialValues: { name: 'Mike', email: 'mike@gmail.com' },
      })
      const validate = jest.fn((value) => (value ? undefined : 'required'))
      let { result } = renderHook(() =>
        useFormField('name', { formContext: formState, validate })
      )

      act(() => {
        result.current.setValue('')
      })

      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate).toHaveBeenCalledWith('', {
        name: 'Mike',
        email: 'mike@gmail.com',
      })
      expect(formState.getStatus()).toEqual({
        dirtyFields: ['name'],
        isDirty: true,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['name'],
        validatingFields: [],
      })
    })

    test('runs async field validation, when field is changed', async () => {
      const formState = createFormStore({
        initialValues: { name: 'Mike', email: 'mike@gmail.com' },
      })
      const validate = jest.fn((value) =>
        Promise.resolve(value ? undefined : 'required')
      )
      let { result } = renderHook(() =>
        useFormField('name', { formContext: formState, validate })
      )

      act(() => {
        result.current.setValue('')
      })

      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate).toHaveBeenCalledWith('', {
        name: 'Mike',
        email: 'mike@gmail.com',
      })
      expect(formState.getStatus()).toEqual({
        dirtyFields: ['name'],
        isDirty: true,
        isValid: false,
        isValidating: true,
        isSubmitting: false,
        errorFields: [],
        validatingFields: ['name'],
      })

      await act(async () => {
        await Promise.resolve()
      })

      expect(formState.getStatus()).toEqual({
        dirtyFields: ['name'],
        isDirty: true,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['name'],
        validatingFields: [],
      })
    })
  })
})

describe('useFormField error fallback', () => {
  const validate = (values) => ({
    name: values.name === 'admin' ? 'reserved' : undefined,
  })

  test('setError(undefined) falls back to the form schema error', () => {
    const formContext = createFormStore({
      initialValues: { name: 'admin' },
      validate,
    })
    const { result } = renderHook(() => useFormField('name', { formContext }))

    act(() => {
      result.current.setError('taken')
    })
    expect(result.current.error).toBe('taken')

    act(() => {
      result.current.setError(undefined)
    })
    expect(result.current.error).toBe('reserved')
  })

  test('a field validate error shows over the schema error and falls back to it', () => {
    const formContext = createFormStore({
      initialValues: { name: '' },
      validate,
    })
    const { result } = renderHook(() =>
      useFormField('name', {
        formContext,
        validate: (value) => (value.length < 3 ? 'too short' : undefined),
      })
    )

    act(() => {
      result.current.setValue('ad')
    })
    expect(result.current.error).toBe('too short')

    act(() => {
      result.current.setValue('admin')
    })
    expect(result.current.error).toBe('reserved')

    act(() => {
      result.current.setValue('Mike')
    })
    expect(result.current.error).toBeUndefined()
  })

  test('an async field validate falls back to the schema error once it passes', async () => {
    const formContext = createFormStore({
      initialValues: { name: '' },
      validate,
    })
    const { result, waitFor } = renderHook(() =>
      useFormField('name', {
        formContext,
        validate: async (value) => (value.length < 3 ? 'too short' : undefined),
      })
    )

    act(() => {
      result.current.setValue('ad')
    })
    await waitFor(() => expect(result.current.error).toBe('too short'))

    act(() => {
      result.current.setValue('admin')
    })
    await waitFor(() => expect(result.current.error).toBe('reserved'))
    expect(result.current.isValidating).toBe(false)
  })
})
