import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useRef,
  useState,
  useEffect,
  useMemo,
} from 'react'
import { createFormStore, FORM_STATUS_PATH } from '../core'
import { isEqual } from '../utils/isEqual'
import { useGetters } from './useGetters'

const FormContext = createContext

const simpleGetter = (value) => value
const valueGetter = (value) =>
  value instanceof Event ? value.target.value : value

const setterFactory =
  (store, storeKey, getter, setters) =>
  (...args) => {
    if (args[0] instanceof Event) {
      store.update([[storeKey, args[0].target.name, getter(args[0])]])
    } else if (args.length === 2) {
      store.update([[storeKey, args[1], getter(args[0])]])
    } else if (args.length === 1 && typeof args[0] === 'string') {
      let key = `${storeKey}-${args[0]}`
      return (
        setters[key] ||
        (setters[key] = (value) =>
          store.update([[storeKey, args[0], getter(value)]]))
      )
    } else if (args.length === 1 && typeof args[0] === 'object') {
      store.update([[storeKey, '', args[0]]])
    }
  }

const useForm = (config = {}) => {
  let storeRef = useRef(),
    prevConfigRef = useRef(config),
    settersRef = useRef()

  if (!storeRef.current) storeRef.current = createFormStore(config)
  if (!settersRef.current) {
    settersRef.current = {}
    settersRef.current.touched = setterFactory(
      storeRef.current,
      'touched',
      Boolean,
      settersRef.current
    )
    settersRef.current.error = setterFactory(
      storeRef.current,
      'fieldErrors',
      simpleGetter,
      settersRef.current
    )
    settersRef.current.value = setterFactory(
      storeRef.current,
      'values',
      valueGetter,
      settersRef.current
    )
  }

  useEffect(() => {
    if (!isEqual(prevConfigRef.current, config)) {
      let { initialValues, ...updatedConfig } = config
      storeRef.current.setConfig(updatedConfig)
      if (!isEqual(prevConfigRef.current.initialValues, initialValues)) {
        storeRef.current.reset(initialValues)
      }
      prevConfigRef.current = config
    }
  }, [config])

  const Form = useMemo(
    () =>
      forwardRef((props, ref) =>
        createElement(
          FormContext.Provider,
          { value: storeRef.current },
          createElement('form', {
            onSubmit: storeRef.current.submit,
            ref,
            ...props,
          })
        )
      ),
    []
  )

  const result = useGetters(
    {
      Form,
      setValue: settersRef.current.value,
      setError: settersRef.current.error,
      setTouched: settersRef.current.touched,
      submit: storeRef.current.submit,
      formContext: storeRef.current,
    },
    '',
    ['value', 'error', 'touched'],
    storeRef.current,
    undefined,
    ['values', 'errors', 'touched']
  )

  return useFormStatusFields(result, storeRef.current)
}

const checkStore = (store) => {
  if (process.env.NODE_ENV !== 'production' && !store) {
    throw new Error(
      'Could not find form context. Please ensure the component is wrapped in a <Form> or formContext is passed as a hook param'
    )
  }
}

const useFormField = (path, fieldConfig) => {
  let store = useContext(FormContext) || fieldConfig?.formContext
  checkStore(store)

  let [values, setValues] = useState()

  useEffect(() => store.subscribe(path, setValues), [path])

  return {
    ...(values || store.getField(path)),
    ...useMemo(
      () => ({
        setValue: (value) => {
          const newValue = valueGetter(value)
          const updates = [['values', path, newValue]]
          if (typeof fieldConfig?.validate === 'function') {
            updates.push([
              'fieldErrors',
              path,
              fieldConfig.validate(newValue, store.getField('').value),
            ])
          }
          store.update(updates)
        },
        setError: (error) => store.update([['fieldErrors', path, error]]),
        setTouched: (touched) =>
          store.update([['touched', path, Boolean(touched)]]),
      }),
      [path, fieldConfig?.validate]
    ),
  }
}

const useFormStatusFields = (target, formContext) => {
  return useGetters(
    target,
    FORM_STATUS_PATH,
    [
      'isDirty',
      'isSubmitting',
      'isValid',
      'isValidating',
      'dirtyFields',
      'errorFields',
      'validatingFields',
    ],
    formContext,
    isEqual
  )
}

const useFormStatus = (formContext) => {
  let store = useContext(FormContext) || formContext
  checkStore(store)

  return useFormStatusFields({}, store)
}

module.exports = { useFormStatus, useFormField, useForm }
