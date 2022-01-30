import { jest } from '@jest/globals'
import { createFormStore, FORM_STATUS_PATH } from '.'

jest.spyOn(global.console, 'error')

const required = (value) => (!value ? 'required' : undefined)
const asyncRequired = (value, delay = 100) =>
  new Promise((res) => {
    setTimeout(() => {
      res(!value ? 'required' : undefined)
    }, delay)
  })

afterEach(() => {
  jest.useRealTimers()
})

describe('createFormStore', () => {
  describe('init', () => {
    it('inits form store with empty config', () => {
      const formStore = createFormStore()
      const values = formStore.getField('')
      const status = formStore.getStatus()

      expect(values).toEqual({
        value: {},
        error: undefined,
        touched: undefined,
      })

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })
    })

    it('inits form store with initial values', () => {
      const initialValues = { first: 'first' }
      const formStore = createFormStore({ initialValues })
      const values = formStore.getField('')
      const status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: 'first' },
        error: undefined,
        touched: undefined,
      })

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })
    })

    it('inits form store with initial values and validation', () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })
      const values = formStore.getField('')
      const status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: 'first' },
        error: { first: undefined, second: 'required' },
        touched: undefined,
      })

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['second'],
        validatingFields: [],
      })
    })

    it('inits form store with initial values and async validation', async () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({ first: asyncRequired(values.first) })
      const formStore = createFormStore({ initialValues, validate })
      let values = formStore.getField('')
      let status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: 'first' },
        error: undefined,
        touched: undefined,
      })

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: true,
        isSubmitting: false,
        errorFields: [],
        validatingFields: ['first'],
      })

      await asyncRequired()

      values = formStore.getField('')
      status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: 'first' },
        error: { first: undefined, second: undefined },
        touched: undefined,
      })

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })
    })
  })

  describe('getField', () => {
    it('returns root form state slice', () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })
      formStore.update([['touched', 'second', true]])
      const rootValues = formStore.getField()

      expect(rootValues).toEqual({
        value: { first: 'first' },
        error: { first: undefined, second: 'required' },
        touched: { second: true },
      })
    })

    it('returns root form state slice with async validation', async () => {
      const initialValues = { first: 'first' }
      const validate = (values) =>
        Promise.resolve({
          first: required(values.first),
          second: required(values.second),
        })
      const formStore = createFormStore({ initialValues, validate })
      formStore.update([['touched', 'second', true]])

      let rootValues = formStore.getField()
      expect(rootValues).toEqual({
        value: { first: 'first' },
        error: undefined,
        touched: { second: true },
      })

      await validate({})

      rootValues = formStore.getField()
      expect(rootValues).toEqual({
        value: { first: 'first' },
        error: { first: undefined, second: 'required' },
        touched: { second: true },
      })
    })

    it('returns root form state slice without validation', () => {
      const initialValues = { first: 'first' }
      const formStore = createFormStore({ initialValues })
      const rootValues = formStore.getField('')

      expect(rootValues).toEqual({
        value: { first: 'first' },
        touched: undefined,
      })
    })

    it('returns form slice for particular field', () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })
      const firstSlice = formStore.getField('first')
      const secondSlice = formStore.getField('second')
      const nestedSlice = formStore.getField('group.first')

      expect(firstSlice).toEqual({
        value: 'first',
        isDirty: false,
        isValidating: false,
        error: undefined,
        touched: false,
      })

      expect(secondSlice).toEqual({
        value: undefined,
        isDirty: false,
        isValidating: false,
        error: 'required',
        touched: false,
      })

      expect(nestedSlice).toEqual({
        value: undefined,
        isDirty: false,
        isValidating: false,
        error: undefined,
        touched: false,
      })
    })

    it('returns form slice for particular field with async validation', async () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: asyncRequired(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })
      let firstSlice = formStore.getField('first')
      let secondSlice = formStore.getField('second')

      expect(firstSlice).toEqual({
        value: 'first',
        isDirty: false,
        isValidating: true,
        error: undefined,
        touched: false,
      })

      expect(secondSlice).toEqual({
        value: undefined,
        isDirty: false,
        isValidating: false,
        error: 'required',
        touched: false,
      })

      const error = await asyncRequired()

      firstSlice = formStore.getField('first')

      expect(firstSlice).toEqual({
        value: 'first',
        isDirty: false,
        isValidating: false,
        error: undefined,
        touched: false,
      })
    })

    it('returns form slice for non-normalized field with async validation', async () => {
      const formStore = createFormStore()

      formStore.update([['values', 'first[0].nested', 'nested']])
      let nestedSlice = formStore.getField('first.0.nested')

      expect(nestedSlice).toEqual({
        value: 'nested',
        isDirty: true,
        isValidating: false,
        error: undefined,
        touched: false,
      })
    })
  })

  describe('getStatus', () => {
    it('returns form status', () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })
      const status = formStore.getStatus()

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['second'],
        validatingFields: [],
      })
    })

    it('returns form status with async validation', () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: asyncRequired(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })
      const status = formStore.getStatus()

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: true,
        isSubmitting: false,
        errorFields: [],
        validatingFields: ['second'],
      })
    })
  })

  describe('updateState', () => {
    it('updates one value', () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })

      formStore.update([['values', 'first', 'newValue']])

      const values = formStore.getField('')
      const status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: 'newValue' },
        error: { first: undefined, second: 'required' },
        touched: undefined,
      })
      expect(status).toEqual({
        dirtyFields: ['first'],
        isDirty: true,
        isSubmitting: false,
        isValid: false,
        isValidating: false,
        errorFields: ['second'],
        validatingFields: [],
      })
    })

    it('updates one value and runs validation', () => {
      jest.useFakeTimers()
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })

      formStore.update([['values', 'first', undefined]])

      let values = formStore.getField('')
      let status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: undefined },
        error: { first: 'required', second: 'required' },
        touched: undefined,
      })
      expect(status).toEqual({
        dirtyFields: ['first'],
        isDirty: true,
        isSubmitting: false,
        isValid: false,
        isValidating: false,
        errorFields: ['first', 'second'],
        validatingFields: [],
      })
    })

    it('updates multiple values and runs validation', async () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({
        first: required(values.first),
        second: asyncRequired(values.second),
      })
      const formStore = createFormStore({ initialValues, validate })
      await asyncRequired()

      formStore.update([
        ['values', 'first', undefined],
        ['values', 'second', 'second'],
        ['fieldErrors', 'third', 'third error'],
      ])

      let values = formStore.getField('')
      let status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: undefined, second: 'second' },
        error: { first: 'required', second: 'required', third: 'third error' },
        touched: undefined,
      })
      expect(status).toEqual({
        dirtyFields: ['first', 'second'],
        isDirty: true,
        isSubmitting: false,
        isValid: false,
        isValidating: true,
        errorFields: ['first', 'second', 'third'],
        validatingFields: ['second'],
      })

      await asyncRequired()

      values = formStore.getField('')
      status = formStore.getStatus()

      expect(values).toEqual({
        value: { first: undefined, second: 'second' },
        error: { first: 'required', second: undefined, third: 'third error' },
        touched: undefined,
      })
      expect(status).toEqual({
        dirtyFields: ['first', 'second'],
        isDirty: true,
        isSubmitting: false,
        isValid: false,
        isValidating: false,
        errorFields: ['first', 'third'],
        validatingFields: [],
      })
    })
  })

  describe('subscribe to value', () => {
    it('subscribes to the value updates', () => {
      const formStore = createFormStore()
      const listener = jest.fn()
      formStore.subscribe('first', listener)
      formStore.update([['values', 'first', 'first']])

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        value: 'first',
        isDirty: true,
        error: undefined,
        touched: false,
        isValidating: false,
      })
    })

    it('is called when nested value updates', async () => {
      const formStore = createFormStore()
      const listener = jest.fn()
      formStore.subscribe('first', listener)
      formStore.update([['values', 'first.nested', 'first']])

      await asyncRequired(undefined, 50)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        value: { nested: 'first' },
        isDirty: true,
        error: undefined,
        touched: false,
        isValidating: false,
      })
      expect(formStore.getStatus()).toEqual({
        dirtyFields: ['first.nested'],
        errorFields: [],
        isDirty: true,
        isSubmitting: false,
        isValid: true,
        isValidating: false,
        validatingFields: [],
      })
    })

    it('is called when parent value updates', () => {
      const formStore = createFormStore()
      const listener = jest.fn()
      formStore.subscribe('first.nested', listener)
      formStore.update([['values', 'first', { nested: 'first' }]])

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        value: 'first',
        isDirty: true,
        error: undefined,
        touched: false,
        isValidating: false,
      })
      expect(formStore.getStatus()).toEqual({
        dirtyFields: ['first', 'first.nested'],
        errorFields: [],
        isDirty: true,
        isSubmitting: false,
        isValid: true,
        isValidating: false,
        validatingFields: [],
      })
    })

    it('is called when the touched field is changed', () => {
      const formStore = createFormStore()
      const listener = jest.fn()
      formStore.subscribe('first', listener)
      formStore.update([['touched', 'first', true]])

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        value: undefined,
        isDirty: false,
        error: undefined,
        touched: true,
        isValidating: false,
      })
    })

    it('is not called when the unrelated field changes', () => {
      const formStore = createFormStore()
      const listener = jest.fn()
      formStore.subscribe('first', listener)
      formStore.update([['touched', 'second', true]])

      expect(listener).not.toHaveBeenCalled()
    })

    it('is called when the field error is changed, by another error', () => {
      jest.useFakeTimers()
      const validate = (values) =>
        values?.second ? { first: 'required' } : undefined
      const formStore = createFormStore({ validate })
      const listener = jest.fn()
      formStore.subscribe('first', listener)
      formStore.update([['values', 'second', 'second']])

      jest.runAllTimers()

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        value: undefined,
        isDirty: false,
        error: 'required',
        touched: false,
        isValidating: false,
      })
    })

    it('is called when the nesetd error is changed by another field', () => {
      jest.useFakeTimers()
      const validate = (values) =>
        values?.second ? { first: { nestedError: 'required' } } : undefined
      const formStore = createFormStore({ validate })
      const listener = jest.fn()
      formStore.subscribe('first', listener)
      formStore.update([['values', 'second', 'second']])

      jest.runAllTimers()

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        value: undefined,
        isDirty: false,
        error: { nestedError: 'required' },
        touched: false,
        isValidating: false,
      })
    })

    it('unsubscribes from the value updates', () => {
      const formStore = createFormStore()
      const listener = jest.fn()
      const unsubscribe = formStore.subscribe('first', listener)
      formStore.update([['values', 'first', 'first']])

      unsubscribe()
      formStore.update([['values', 'first', 'newValue']])

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        value: 'first',
        isDirty: true,
        error: undefined,
        touched: false,
        isValidating: false,
      })
    })

    it('several subscriptions to the same field do not affect each other', () => {
      const formStore = createFormStore()
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      const unsubscribe1 = formStore.subscribe('first', listener1)
      formStore.subscribe('first', listener2)
      formStore.update([['values', 'first', 'first']])

      unsubscribe1()
      formStore.update([['values', 'first', 'newValue']])

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener1).toHaveBeenCalledWith({
        value: 'first',
        isDirty: true,
        error: undefined,
        touched: false,
        isValidating: false,
      })

      expect(listener2).toHaveBeenCalledTimes(2)
      expect(listener2).toHaveBeenNthCalledWith(1, {
        value: 'first',
        isDirty: true,
        error: undefined,
        touched: false,
        isValidating: false,
      })
      expect(listener2).toHaveBeenNthCalledWith(2, {
        value: 'newValue',
        isDirty: true,
        error: undefined,
        touched: false,
        isValidating: false,
      })
    })
  })

  describe('subscribe to form status', () => {
    it('subscribes to the form status updates', () => {
      jest.useFakeTimers()
      const formStore = createFormStore({ debounceValidation: 50 })
      const listener = jest.fn()
      formStore.subscribe(FORM_STATUS_PATH, listener)

      formStore.update([['fieldErrors', 'third', 'third error']])

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      jest.runAllTimers()

      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener).toHaveBeenNthCalledWith(2, {
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['third'],
        validatingFields: [],
      })
    })

    it('unsubscribes to the form status updates', () => {
      jest.useFakeTimers()
      const formStore = createFormStore({ debounceValidation: 50 })
      const listener = jest.fn()
      const unsubscribe = formStore.subscribe(FORM_STATUS_PATH, listener)

      formStore.update([['fieldErrors', 'third', 'third error']])
      unsubscribe()
      formStore.update([['fieldErrors', 'second', 'second error']])

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      jest.runAllTimers()

      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('reset', () => {
    it('resets the form with values and notifies subscribers', () => {
      const formStore = createFormStore()
      const firstFieldListener = jest.fn()
      const secondFieldListener = jest.fn()
      const formStatusListener = jest.fn()

      formStore.update([['values', 'first', 'first']])
      formStore.subscribe('first', firstFieldListener)
      formStore.subscribe('second', secondFieldListener)
      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)

      expect(formStore.getField('').value.first).toBe('first')
      expect(formStore.getStatus().isDirty).toBeTruthy()

      formStore.reset({ first: 'new value' })

      expect(formStore.getField('').value.first).toBe('new value')
      expect(formStore.getStatus().isDirty).toBeFalsy()

      expect(firstFieldListener).toHaveBeenCalledTimes(1)
      expect(firstFieldListener).toHaveBeenCalledWith({
        value: 'new value',
        isDirty: false,
        error: undefined,
        isValidating: false,
        touched: false,
      })

      expect(secondFieldListener).toHaveBeenCalledTimes(1)
      expect(secondFieldListener).toHaveBeenCalledWith({
        value: undefined,
        isDirty: false,
        error: undefined,
        isValidating: false,
        touched: false,
      })

      expect(formStatusListener).toHaveBeenCalledTimes(1)
      expect(formStatusListener).toHaveBeenCalledWith({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })
    })

    it('resets the form to initial values', () => {
      const initialValues = { first: 'second' }
      const formStore = createFormStore({ initialValues })
      const firstFieldListener = jest.fn()
      const secondFieldListener = jest.fn()
      const formStatusListener = jest.fn()

      expect(formStore.getField('').value).toBe(initialValues)
      expect(formStore.getStatus().isDirty).toBeFalsy()

      formStore.update([['values', 'first', 'first']])

      expect(formStore.getField('').value.first).toBe('first')
      expect(formStore.getStatus().isDirty).toBeTruthy()

      formStore.reset()

      expect(formStore.getField('').value).toBe(initialValues)
      expect(formStore.getStatus().isDirty).toBeFalsy()
    })
  })

  describe('handleSubmit', () => {
    it('does not prevent standard form submit event if onSubmit was not defined in config', () => {
      const formStore = createFormStore()
      const event = {
        preventDefault: jest.fn(),
      }
      formStore.submit(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('does not submit form if form is not valid', () => {
      const onSubmit = jest.fn(() => Promise.resolve())
      const validate = (values = {}) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ validate, onSubmit })

      formStore.submit()

      expect(onSubmit).not.toHaveBeenCalled()
      const values = formStore.getField('')

      expect(values.touched).toEqual({
        first: true,
        second: true,
      })
    })

    it('does not submit form if form is validating', () => {
      const onSubmit = jest.fn()
      const validate = (values = {}) => ({
        first: asyncRequired(values.first),
      })
      const formStore = createFormStore({
        onSubmit,
        validate,
      })
      const event = {
        preventDefault: jest.fn(),
      }
      formStore.update([['values', 'first', 'first']])
      formStore.submit(event)

      expect(formStore.getStatus().validatingFields).toEqual(['first'])
      expect(event.preventDefault).toHaveBeenCalled()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('submits the form', async () => {
      jest.useFakeTimers()
      const onSubmit = jest.fn(() => Promise.resolve())
      const validate = (values = {}) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ validate, onSubmit })
      const formStatusListener = jest.fn()
      const event = {
        type: 'submit',
        preventDefault: jest.fn(),
      }

      formStore.update([['values', 'first', 'first']])
      formStore.update([['values', 'second', 'second']])

      jest.runAllTimers()

      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)

      const submitPromise = formStore.submit(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(formStatusListener).toHaveBeenCalledTimes(1)
      expect(formStatusListener).toHaveBeenCalledWith({
        dirtyFields: ['first', 'second'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: true,
        errorFields: [],
        validatingFields: [],
      })

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith(
        {
          first: 'first',
          second: 'second',
        },
        expect.objectContaining({
          dirtyFields: ['first', 'second'],
        })
      )

      await submitPromise
      expect(formStatusListener).toHaveBeenCalledTimes(2)
      expect(formStatusListener).toHaveBeenNthCalledWith(2, {
        dirtyFields: ['first', 'second'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })
    })

    it('resets form to submitted values', async () => {
      const onSubmit = jest.fn((_values, { reset }) =>
        Promise.resolve().then(() => reset())
      )
      const validate = (values = {}) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ validate, onSubmit })
      const event = {
        type: 'submit',
        preventDefault: jest.fn(),
      }

      formStore.update([['values', 'first', 'first']])
      formStore.update([['values', 'second', 'second']])

      const submitPromise = formStore.submit(event)

      expect(formStore.getStatus()).toEqual({
        dirtyFields: ['first', 'second'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: true,
        errorFields: [],
        validatingFields: [],
      })

      await submitPromise
      expect(formStore.getStatus()).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })
      expect(formStore.getField('').value).toEqual({
        first: 'first',
        second: 'second',
      })
    })

    it('resets form to new values', async () => {
      const onSubmit = jest.fn((_values, { reset }) =>
        Promise.resolve().then(() => reset({}))
      )
      const validate = (values = {}) => ({
        first: required(values.first),
        second: required(values.second),
      })
      const formStore = createFormStore({ validate, onSubmit })
      const event = {
        type: 'submit',
        preventDefault: jest.fn(),
      }

      formStore.update([['values', 'first', 'first']])
      formStore.update([['values', 'second', 'second']])

      const submitPromise = formStore.submit(event)

      expect(formStore.getStatus()).toEqual({
        dirtyFields: ['first', 'second'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: true,
        errorFields: [],
        validatingFields: [],
      })

      await submitPromise
      expect(formStore.getStatus()).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['first', 'second'],
        validatingFields: [],
      })
      expect(formStore.getField('').value).toEqual({})
    })
  })

  describe('validation', () => {
    it('validate form on value update', () => {
      jest.useFakeTimers()
      const initialValues = { first: 'first' }
      const validate = (values) => ({ first: required(values.first) })
      const formStore = createFormStore({
        initialValues,
        validate,
        debounceValidation: 50,
      })
      const formStatusListener = jest.fn()
      const status = formStore.getStatus()
      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['values', 'first', undefined]])

      expect(formStatusListener).toHaveBeenCalledTimes(1)
      expect(formStatusListener).toHaveBeenCalledWith({
        dirtyFields: ['first'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      jest.runAllTimers()

      expect(formStatusListener).toHaveBeenCalledTimes(2)
      expect(formStatusListener).toHaveBeenNthCalledWith(2, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['first'],
        validatingFields: [],
      })
    })

    it('validate form on value update with debouncing', () => {
      jest.useFakeTimers()
      const initialValues = { first: 'first' }
      const validate = (values) => ({ first: required(values.first) })
      const formStore = createFormStore({
        initialValues,
        validate,
        debounceValidation: 50,
      })
      const formStatusListener = jest.fn()
      const status = formStore.getStatus()
      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['values', 'first', undefined]])

      expect(formStatusListener).toHaveBeenCalledTimes(1)
      expect(formStatusListener).toHaveBeenCalledWith({
        dirtyFields: ['first'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['values', 'first', 'first']])

      expect(formStatusListener).toHaveBeenCalledTimes(2)
      expect(formStatusListener).toHaveBeenNthCalledWith(2, {
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['values', 'first', undefined]])

      expect(formStatusListener).toHaveBeenCalledTimes(3)
      expect(formStatusListener).toHaveBeenNthCalledWith(3, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      jest.runAllTimers()

      expect(formStatusListener).toHaveBeenCalledTimes(4)
      expect(formStatusListener).toHaveBeenNthCalledWith(4, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['first'],
        validatingFields: [],
      })
    })

    it('validate form on field error update', () => {
      jest.useFakeTimers()
      const initialValues = { first: 'first' }
      const validate = (values) => ({ first: required(values.first) })
      const formStore = createFormStore({
        initialValues,
        validate,
        debounceValidation: 50,
      })
      const formStatusListener = jest.fn()
      const status = formStore.getStatus()
      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['fieldErrors', 'first', 'first error']])

      expect(formStatusListener).toHaveBeenCalledTimes(1)
      expect(formStatusListener).toHaveBeenCalledWith({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      jest.runAllTimers()

      expect(formStatusListener).toHaveBeenCalledTimes(2)
      expect(formStatusListener).toHaveBeenNthCalledWith(2, {
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['first'],
        validatingFields: [],
      })
    })

    it('validate form on field error update', async () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({ first: required(values.first) })
      const formStore = createFormStore({
        initialValues,
        validate,
      })
      const formStatusListener = jest.fn()
      const status = formStore.getStatus()
      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['fieldErrors', 'first', asyncRequired()]])

      expect(formStatusListener).toHaveBeenCalledTimes(2)
      expect(formStatusListener).toHaveBeenCalledWith({
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: true,
        isSubmitting: false,
        errorFields: [],
        validatingFields: ['first'],
      })

      await asyncRequired()

      expect(formStatusListener).toHaveBeenCalledTimes(3)
      expect(formStatusListener).toHaveBeenNthCalledWith(3, {
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['first'],
        validatingFields: [],
      })
    })

    it('validate form on value update and async validation', async () => {
      const initialValues = { first: 'first' }
      const validate = (values) => ({ first: asyncRequired(values.first) })
      const formStore = createFormStore({
        initialValues,
        validate,
        debounceValidation: 50,
      })
      const formStatusListener = jest.fn()

      await asyncRequired()

      const status = formStore.getStatus()
      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['values', 'first', undefined]])

      expect(formStatusListener).toHaveBeenCalledTimes(1)
      expect(formStatusListener).toHaveBeenCalledWith({
        dirtyFields: ['first'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      await asyncRequired(undefined, 50)

      expect(formStatusListener).toHaveBeenCalledTimes(2)
      expect(formStatusListener).toHaveBeenNthCalledWith(2, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: false,
        isValidating: true,
        isSubmitting: false,
        errorFields: [],
        validatingFields: ['first'],
      })

      await asyncRequired()

      expect(formStatusListener).toHaveBeenCalledTimes(3)
      expect(formStatusListener).toHaveBeenNthCalledWith(3, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['first'],
        validatingFields: [],
      })
    })

    it('validate form with async validation', async () => {
      const initialValues = { first: 'first' }
      const validate = (values) =>
        asyncRequired().then(() => ({ first: required(values.first) }))
      const formStore = createFormStore({
        initialValues,
        validate,
        debounceValidation: 50,
      })
      const formStatusListener = jest.fn()
      const fieldListener = jest.fn()
      const status = formStore.getStatus()
      formStore.subscribe(FORM_STATUS_PATH, formStatusListener)
      formStore.subscribe('first', fieldListener)

      expect(status).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: false,
        isValidating: true,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      await validate({})

      expect(formStatusListener).toHaveBeenCalledTimes(1)
      expect(formStatusListener).toHaveBeenNthCalledWith(1, {
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      expect(fieldListener).toHaveBeenCalledTimes(1)
      expect(fieldListener).toHaveBeenNthCalledWith(1, {
        value: 'first',
        isDirty: false,
        isValidating: false,
        error: undefined,
        touched: false,
      })

      formStore.update([['values', 'first', undefined]])

      expect(formStatusListener).toHaveBeenCalledTimes(2)
      expect(formStatusListener).toHaveBeenNthCalledWith(2, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      expect(fieldListener).toHaveBeenCalledTimes(2)
      expect(fieldListener).toHaveBeenNthCalledWith(2, {
        value: undefined,
        isDirty: true,
        isValidating: false,
        error: undefined,
        touched: false,
      })

      await asyncRequired(undefined, 50)

      expect(formStatusListener).toHaveBeenCalledTimes(3)
      expect(formStatusListener).toHaveBeenNthCalledWith(3, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: false,
        isValidating: true,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      expect(fieldListener).toHaveBeenCalledTimes(2)

      await validate({})

      expect(formStatusListener).toHaveBeenCalledTimes(4)
      expect(formStatusListener).toHaveBeenNthCalledWith(4, {
        dirtyFields: ['first'],
        isDirty: true,
        isValid: false,
        isValidating: false,
        isSubmitting: false,
        errorFields: ['first'],
        validatingFields: [],
      })
      expect(fieldListener).toHaveBeenCalledTimes(3)
      expect(fieldListener).toHaveBeenNthCalledWith(3, {
        value: undefined,
        isDirty: true,
        isValidating: false,
        error: 'required',
        touched: false,
      })
    })
  })

  describe('dirty fields', () => {
    it('keeps track of dirty fields', () => {
      const initialValues = { first: 'first' }
      const formStore = createFormStore({ initialValues })

      expect(formStore.getStatus()).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['values', 'first', 'newValue']])
      expect(formStore.getStatus()).toEqual({
        dirtyFields: ['first'],
        isDirty: true,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })

      formStore.update([['values', 'first', 'first']])
      expect(formStore.getStatus()).toEqual({
        dirtyFields: [],
        isDirty: false,
        isValid: true,
        isValidating: false,
        isSubmitting: false,
        errorFields: [],
        validatingFields: [],
      })
    })
  })
})
