import { jest } from '@jest/globals'
import { createElement, useRef, useEffect } from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { create } from 'react-test-renderer'

import { createEvent } from '../test/utils'

import { useForm, useFormField, useFormStatus } from '.'

const useWrapper = (config) => {
  const counterRef = useRef(0)

  useEffect(() => {
    counterRef.current++
  })

  const form = useForm(config)

  return {
    form,
    counterRef,
  }
}

describe('useForm', () => {
  test('returns form state', () => {
    const initialValues = { name: 'name', number: 123 }
    let { result } = renderHook(() => useForm({ initialValues }))

    expect(typeof result.current.setValue).toBe('function')
    expect(typeof result.current.setError).toBe('function')
    expect(typeof result.current.setTouched).toBe('function')
    expect(typeof result.current.Form.render).toBe('function')
    expect(typeof result.current.submit).toBe('function')

    expect(result.current.dirtyFields).toEqual([])
    expect(result.current.errorFields).toEqual([])
    expect(result.current.isSubmitting).toBeFalsy()
    expect(result.current.isValidating).toBeFalsy()
    expect(result.current.isValid).toBeTruthy()
    expect(result.current.isDirty).toBeFalsy()
    expect(result.current.validatingFields).toEqual([])

    expect(result.current.values).toBe(initialValues)
    expect(result.current.errors).toBeUndefined()
    expect(result.current.touched).toBeUndefined()
  })

  test('reset form state if form config is updated', () => {
    const initialConfig = { initialValues: { name: 'name', number: 123 } }
    let { result, rerender } = renderHook((config) => useForm(config), {
      initialProps: initialConfig,
    })

    expect(result.current.dirtyFields).toEqual([])
    expect(result.current.errorFields).toEqual([])
    expect(result.current.isSubmitting).toBeFalsy()
    expect(result.current.isValidating).toBeFalsy()
    expect(result.current.isValid).toBeTruthy()
    expect(result.current.isDirty).toBeFalsy()
    expect(result.current.validatingFields).toEqual([])

    expect(result.current.values).toBe(initialConfig.initialValues)
    expect(result.current.errors).toBeUndefined()
    expect(result.current.touched).toBeUndefined()

    const newConfig = {
      debounce: 0,
      initialValues: { first: 'first' },
      validate: (values) => {
        return {
          second: values.second ? undefined : 'required',
        }
      },
    }
    rerender(newConfig)

    expect(result.current.dirtyFields).toEqual([])
    expect(result.current.errorFields).toEqual(['second'])
    expect(result.current.isSubmitting).toBeFalsy()
    expect(result.current.isValidating).toBeFalsy()
    expect(result.current.isValid).toBeFalsy()
    expect(result.current.isDirty).toBeFalsy()
    expect(result.current.validatingFields).toEqual([])

    expect(result.current.values).toBe(newConfig.initialValues)
    expect(result.current.errors).toEqual({ second: 'required' })
    expect(result.current.touched).toBeUndefined()
  })

  describe('setters', () => {
    test('keeps function references between re-renders', () => {
      const initialValues = { name: 'name', number: 123 }
      let { result, rerender } = renderHook(() => useForm({ initialValues }))

      const setValue = result.current.setValue
      const setError = result.current.setError
      const setTouched = result.current.setTouched
      const update = result.current.update
      const onSubmit = result.current.onSubmit

      expect(result.current.values).toBe(initialValues)
      expect(result.current.errors).toBeUndefined()
      expect(result.current.touched).toBeUndefined()

      rerender()

      expect(result.current.setValue).toBe(setValue)
      expect(result.current.setTouched).toBe(setTouched)
      expect(result.current.setError).toBe(setError)
      expect(result.current.update).toBe(update)
      expect(result.current.onSubmit).toBe(onSubmit)
    })

    test('keeps function references when form config is updated', () => {
      const initialValues = { name: 'name', number: 123 }
      let { result, rerender } = renderHook((values = initialValues) =>
        useForm({ initialValues: values })
      )

      const setValue = result.current.setValue
      const setError = result.current.setError
      const setTouched = result.current.setTouched
      const update = result.current.update
      const onSubmit = result.current.onSubmit

      const newValues = { first: 'first' }
      rerender(newValues)

      expect(result.current.setValue).toBe(setValue)
      expect(result.current.setTouched).toBe(setTouched)
      expect(result.current.setError).toBe(setError)
      expect(result.current.update).toBe(update)
      expect(result.current.onSubmit).toBe(onSubmit)
    })

    describe('setValues', () => {
      test('keeps reference with specific field', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result, rerender } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })

        const fieldSetValue = result.current.setValue('name')
        expect(typeof fieldSetValue).toBe('function')

        rerender()
        const secondFieldSetValue = result.current.setValue('name')
        expect(typeof secondFieldSetValue).toBe('function')
        expect(secondFieldSetValue).toBe(fieldSetValue)
      })

      test('it updates value when called with event', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        const event = createEvent('change', { name: 'name', value: 'W' })

        act(() => {
          result.current.setValue(event)
        })
        expect(result.current.values).toEqual({ name: 'W', number: 123 })
      })

      test('it updates value when called with new value and path', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        act(() => {
          result.current.setValue('name', 'W')
        })
        expect(result.current.values).toEqual({ name: 'W', number: 123 })
      })

      test('it updates value when called with path and then with new value', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        act(() => {
          result.current.setValue('name')('W')
        })
        expect(result.current.values).toEqual({ name: 'W', number: 123 })
      })

      test('it updates value when called with path and then with event', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        const event = createEvent('change', { name: 'name', value: 'W' })

        act(() => {
          result.current.setValue('name')(event)
        })
        expect(result.current.values).toEqual({ name: 'W', number: 123 })
      })

      test('it updates the whole form, if called just with object', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })

        const newValues = { first: 'first', second: 'second' }
        act(() => {
          result.current.setValue(newValues)
        })
        expect(result.current.values).toEqual(newValues)
      })
    })

    describe('setError', () => {
      test('keeps reference to the setError with specific field', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result, rerender } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })

        const fieldSetError = result.current.setError('name')
        expect(typeof fieldSetError).toBe('function')

        rerender()
        const secondFieldSetError = result.current.setError('name')
        expect(typeof secondFieldSetError).toBe('function')
        expect(secondFieldSetError).toBe(fieldSetError)
      })

      test('it updates field error when called with error and path', () => {
        const initialConfig = {
          initialValues: { name: 'name', number: 123 },
          debounce: 0,
        }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        expect(result.current.isValid).toBeTruthy()

        act(() => {
          result.current.setError('name', 'test error')
        })
        expect(result.current.errors).toEqual({ name: 'test error' })
        expect(result.current.errorFields).toEqual(['name'])
        expect(result.current.isValid).toBeFalsy()
      })

      test('it updates field error when called with path and then with error', () => {
        const initialConfig = {
          initialValues: { name: 'name', number: 123 },
          debounce: 0,
        }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        expect(result.current.isValid).toBeTruthy()

        act(() => {
          result.current.setError('name')('test error')
        })
        expect(result.current.errors).toEqual({ name: 'test error' })
        expect(result.current.errorFields).toEqual(['name'])
        expect(result.current.isValid).toBeFalsy()
      })

      test('it updates all errors, if called just with object', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })

        const newErrors = { first: 'required', second: 'required' }
        act(() => {
          result.current.setError(newErrors)
        })
        expect(result.current.errors).toEqual(newErrors)
        expect(result.current.errorFields).toEqual(['first', 'second'])
        expect(result.current.isValid).toBeFalsy()
      })
    })

    describe('setTouched', () => {
      test('keeps reference to the setTouched with specific field', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result, rerender } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })

        const fieldSetTouched = result.current.setTouched('name')
        expect(typeof fieldSetTouched).toBe('function')

        rerender()
        const secondFieldSetTouched = result.current.setTouched('name')
        expect(typeof secondFieldSetTouched).toBe('function')
        expect(secondFieldSetTouched).toBe(fieldSetTouched)
      })

      test('it updates touched value when called with event', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        const event = createEvent('blur', { name: 'name', value: 'W' })

        act(() => {
          result.current.setTouched(event)
        })
        expect(result.current.touched).toEqual({ name: true })
      })

      test('it updates touched value when called with new touched value and path', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        act(() => {
          result.current.setTouched(createEvent('touch', { name: 'name' }))
        })
        expect(result.current.touched).toEqual({ name: true })
        act(() => {
          result.current.setTouched('name', false)
        })
        expect(result.current.touched).toEqual({ name: false })
      })

      test('it updates touched value when called with path and then with new touched value', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })
        act(() => {
          result.current.setTouched('name')(
            createEvent('touch', { name: 'name' })
          )
        })
        expect(result.current.touched).toEqual({ name: true })

        act(() => {
          result.current.setTouched('name')(false)
        })
        expect(result.current.touched).toEqual({ name: false })
      })

      test('it updates touched values for the whole form, if called just with object', () => {
        const initialConfig = { initialValues: { name: 'name', number: 123 } }
        let { result } = renderHook((config) => useForm(config), {
          initialProps: initialConfig,
        })

        const newTouched = { first: true, name: true, number: false }
        act(() => {
          result.current.setTouched(newTouched)
        })
        expect(result.current.touched).toEqual(newTouched)
      })
    })
  })

  test('updates values in the form and cause rerendering, if subscribed', async () => {
    const config = { initialValues: { name: 'name', number: 123 } }
    let { result } = renderHook(() => useWrapper(config))

    expect(result.current.counterRef.current).toBe(1)
    expect(result.current.form.values).toBe(config.initialValues)
    act(() => {
      result.current.form.setValue('name', 'W')
    })
    expect(result.current.form.values).toEqual({ name: 'W', number: 123 })
    expect(result.current.counterRef.current).toBe(2)

    act(() => {
      result.current.form.setValue('name', 'Wi')
    })
    expect(result.current.form.values).toEqual({ name: 'Wi', number: 123 })
    expect(result.current.counterRef.current).toBe(3)

    act(() => {
      result.current.form.setValue('name', 'Wil')
    })
    expect(result.current.form.values).toEqual({ name: 'Wil', number: 123 })
    expect(result.current.counterRef.current).toBe(4)

    act(() => {
      result.current.form.setValue('name', 'Will')
    })
    expect(result.current.form.values).toEqual({ name: 'Will', number: 123 })
    expect(result.current.counterRef.current).toBe(5)
  })

  test('updates values in the form and does not cause rerendering, if not subscribed', () => {
    const config = { initialValues: { name: 'name', number: 123 } }
    let { result } = renderHook(() => useWrapper(config))

    expect(result.current.counterRef.current).toBe(1)
    act(() => {
      result.current.form.setValue('W', 'name')
    })
    expect(result.current.counterRef.current).toBe(1)

    act(() => {
      result.current.form.setValue('Wi', 'name')
    })
    act(() => {
      result.current.form.setValue('Wil', 'name')
    })
    act(() => {
      result.current.form.setValue('Wil', 'name')
    })
    expect(result.current.counterRef.current).toBe(1)
  })
})

describe('useForm fixes', () => {
  test('<Form> provides the form context to useFormField and useFormStatus', () => {
    const Field = () => {
      const field = useFormField('name')
      const status = useFormStatus()
      return createElement('input', {
        value: field.value,
        'data-dirty': status.isDirty,
        readOnly: true,
      })
    }
    const App = () => {
      const { Form } = useForm({ initialValues: { name: 'Mike' } })
      return createElement(Form, null, createElement(Field))
    }

    let root
    act(() => {
      root = create(createElement(App))
    })
    const input = root.root.findByType('input')
    expect(input.props.value).toBe('Mike')
    expect(input.props['data-dirty']).toBe(false)
  })

  test('useFormStatus inside <Form> updates when a field changes', () => {
    let field
    const Field = () => {
      field = useFormField('name')
      const status = useFormStatus()
      return createElement('input', {
        value: field.value,
        'data-dirty': status.isDirty,
        readOnly: true,
      })
    }
    const App = () => {
      const { Form } = useForm({ initialValues: { name: 'Mike' } })
      return createElement(Form, null, createElement(Field))
    }

    let root
    act(() => {
      root = create(createElement(App))
    })
    act(() => {
      field.setValue('Will')
    })
    const input = root.root.findByType('input')
    expect(input.props.value).toBe('Will')
    expect(input.props['data-dirty']).toBe(true)
  })

  test('still marks a named control touched on blur', () => {
    let { result } = renderHook(() => useForm())
    act(() => {
      result.current.setTouched(createEvent('blur', { name: 'name' }))
    })

    expect(result.current.touched).toEqual({ name: true })
  })

  test('ignores blur and change events from controls without a name', () => {
    let { result } = renderHook(() =>
      useForm({ initialValues: { name: 'Mike' } })
    )
    act(() => {
      result.current.setTouched('name', true)
    })
    act(() => {
      result.current.setTouched(createEvent('blur', { name: '' }))
      result.current.setValue(createEvent('change', { name: '', value: 'x' }))
    })

    expect(result.current.touched).toEqual({ name: true })
    expect(result.current.values).toEqual({ name: 'Mike' })
  })

  test('shows the schema error again after setError(path, undefined)', () => {
    let { result } = renderHook(() =>
      useForm({
        validate: (values) => ({ name: values.name ? undefined : 'required' }),
      })
    )
    act(() => {
      result.current.setError('name', 'taken')
    })
    expect(result.current.errors).toEqual({ name: 'taken' })

    act(() => {
      result.current.setError('name', undefined)
    })
    expect(result.current.errors).toEqual({ name: 'required' })
  })

  test('falls back to the schema error when a server error resolves empty', async () => {
    let { result, waitFor } = renderHook(() =>
      useForm({
        validate: (values) => ({ name: values.name ? undefined : 'required' }),
      })
    )
    act(() => {
      result.current.setError('name', Promise.resolve('taken'))
    })
    await waitFor(() =>
      expect(result.current.errors).toEqual({ name: 'taken' })
    )

    act(() => {
      result.current.setError('name', Promise.resolve(undefined))
    })
    await waitFor(() =>
      expect(result.current.errors).toEqual({ name: 'required' })
    )
  })

  test('re-runs validation when validate changes', () => {
    const initialValues = { name: '' }
    let { result, rerender } = renderHook((config) => useForm(config), {
      initialProps: { initialValues },
    })
    expect(result.current.errorFields).toEqual([])

    rerender({
      initialValues,
      validate: (values) => ({ name: values.name ? undefined : 'required' }),
    })
    expect(result.current.errorFields).toEqual(['name'])
    expect(result.current.isValid).toBe(false)
  })

  test('an inline onSubmit does not re-run validation on re-render', () => {
    const validate = jest.fn(() => ({}))
    let { result, rerender } = renderHook(() =>
      useForm({ initialValues: { name: '' }, validate, onSubmit: () => {} })
    )
    expect(validate).toHaveBeenCalledTimes(1)

    rerender()
    rerender()
    expect(validate).toHaveBeenCalledTimes(1)
    expect(result.current.isValid).toBe(true)
  })

  test('an inline sync validate does not cause a render loop', () => {
    let calls = 0
    let { result } = renderHook(() => {
      const form = useWrapper({
        initialValues: { name: '' },
        validate: (values) => {
          // A render loop would otherwise hang the test
          if (++calls > 10) throw new Error('render loop')
          return { name: values.name ? undefined : 'required' }
        },
      })
      return { ...form, errors: form.form.errors, isValid: form.form.isValid }
    })
    expect(result.current.errors).toEqual({ name: 'required' })
    expect(result.current.isValid).toBe(false)

    act(() => {
      result.current.form.setValue('name', 'Mike')
    })
    expect(result.error).toBeUndefined()
    expect(result.current.errors).toEqual({ name: undefined })
    expect(result.current.isValid).toBe(true)
    expect(calls).toBeLessThanOrEqual(3)
    expect(result.current.counterRef.current).toBe(2)
  })

  test('an inline async validate settles', async () => {
    let calls = 0
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: '' },
        // A render loop never yields to timers, so cap it to fail, not hang
        validate: (values) =>
          ++calls > 10
            ? new Promise(() => {})
            : Promise.resolve({ name: values.name ? undefined : 'required' }),
      })
    )
    expect(result.current.isValidating).toBe(true)

    await act(() => new Promise((res) => setTimeout(res, 50)))
    expect(calls).toBeLessThanOrEqual(3)
    expect(result.current.isValidating).toBe(false)
    expect(result.current.errors).toEqual({ name: 'required' })
  })
})
