import { debounce } from '../utils/debounce.js'
import { flatten } from '../utils/flatten.js'
import { isEqual } from '../utils/isEqual.js'
import { set } from '../utils/set.js'
import { get } from '../utils/get.js'
import { memoise } from '../utils/memoise.js'

const normalizePath = memoise((path) =>
  path.includes('[') ? path.replace(/\[/g, '.').replace(/]/g, '') : path
)

const EMPTY_ARRAY = []
export const FORM_STATUS_PATH = '__status__'

export function getFieldsDiff(fields1 = {}, fields2 = {}) {
  let fieldsSet = new Set(Object.keys(fields1))
  for (let path in fields2) {
    if (fields1[path] === fields2[path]) fieldsSet.delete(path)
    else fieldsSet.add(path)
  }
  return fieldsSet
}

export const fieldsToArray = (fieldsObject) =>
  fieldsObject
    ? Object.keys(fieldsObject).filter((key) => fieldsObject[key])
    : EMPTY_ARRAY

export const filterMatchingFields = (paths, fields) => {
  let listeners = new Set()

  for (const path of new Set(paths)) {
    for (const field of new Set(fields)) {
      if (path === field || path.startsWith(field) || field.startsWith(path)) {
        listeners.add(path)
        break
      }
    }
  }
  return [...listeners]
}

export const createFormStore = ({ initialValues, ...initialConfig } = {}) => {
  let state = {},
    listeners = {},
    fieldErrors = {},
    config = {},
    debouncedValidate

  const processAsyncError = (path) => (result) => {
    update([
      ['errors', path, result],
      ['flatValidations', path, undefined],
      ['flatErrors', path, result],
    ])
  }

  const processErrors = (validationState) => {
    let flatValidations = {},
      flatErrors = {},
      errors
    for (let [path, error] of Object.entries({
      ...flatten(validationState),
      ...flatten(fieldErrors),
    })) {
      if (error instanceof Promise) {
        flatValidations[path] = error.then(processAsyncError(path))
        let lastPathError = state.flatErrors?.[path]
        if (lastPathError) {
          flatErrors[path] = lastPathError
          errors = set(errors, path, lastPathError)
        }
      } else {
        flatErrors[path] = error
        errors = set(errors, path, error)
      }
    }

    let updatePaths = new Set([
      FORM_STATUS_PATH,
      ...getFieldsDiff(flatErrors, state.flatErrors),
      ...getFieldsDiff(flatValidations, state.flatValidations),
    ])
    state = {
      ...state,
      isValidating: undefined,
      flatErrors,
      flatValidations,
      errors,
    }
    notify(filterMatchingFields(Object.keys(listeners), updatePaths))
  }

  const validate = (values) => {
    let validationState = config.validate && config.validate(values)
    if (!validationState && !Object.keys(fieldErrors).length) return
    if (validationState instanceof Promise) {
      state.isValidating = true
      notify([FORM_STATUS_PATH])
      validationState.then(processErrors)
    } else processErrors(validationState)
  }

  const reset = (values = initialValues ?? {}) => {
    state = {
      dirtyFields: {},
      initialValues: values,
      isSubmitting: false,
      values,
    }
    validate(values)
    notify(Object.keys(listeners))
  }

  const setConfig = (newConfig) => {
    config = newConfig
    debouncedValidate = config.debounceValidation
      ? debounce(validate, config.debounceValidation)
      : validate
  }

  const getField = (name = '') =>
    name === FORM_STATUS_PATH
      ? getStatus()
      : {
          error: name ? get(state.errors, name) : state.errors,
          isDirty: name
            ? !isEqual(get(state.values, name), get(state.initialValues, name))
            : undefined,
          isValidating: name
            ? state.isValidating ||
              Boolean(state.flatValidations && state.flatValidations[name])
            : undefined,
          touched: get(state.touched, name) || (name ? false : undefined),
          value: name ? get(state.values, name) : state.values,
        }

  const getStatus = () => {
    let validatingFields = fieldsToArray(state.flatValidations),
      errorFields = fieldsToArray(state.flatErrors),
      dirtyFields = fieldsToArray(state.dirtyFields)

    return {
      dirtyFields: dirtyFields,
      errorFields,
      isSubmitting: state.isSubmitting,
      isValidating: state.isValidating || Boolean(validatingFields.length),
      isValid: !(
        state.isValidating ||
        validatingFields.length ||
        errorFields.length
      ),
      isDirty: Boolean(dirtyFields.length),
      validatingFields,
    }
  }

  const notify = (paths) => {
    for (let path of paths) {
      if (listeners[path]) {
        let data = path === FORM_STATUS_PATH ? getStatus() : getField(path)
        listeners[path].forEach((listener) => listener(data))
      }
    }
  }

  const update = (updates) => {
    let updatePaths = [FORM_STATUS_PATH],
      shouldValidate = false

    updates.forEach(([type, path, value]) => {
      const clearedPath = normalizePath(path)
      if (type) updatePaths.push(clearedPath)

      if (type === 'values') {
        shouldValidate = true
        state.dirtyFields[clearedPath] = !isEqual(
          value,
          get(state.initialValues, clearedPath)
        )
        if (typeof value === 'object') {
          const flatValue = flatten(value, clearedPath)
          for (const key in flatValue) {
            state.dirtyFields[key] = !isEqual(
              value,
              get(state.initialValues, key)
            )
          }
        }
      }

      if (type === 'fieldErrors') {
        shouldValidate = true
        fieldErrors[clearedPath] = value
      } else {
        state = set(state, `${type}.${clearedPath}`, value)
      }
    })
    if (shouldValidate) debouncedValidate(state.values)
    notify(filterMatchingFields(Object.keys(listeners), new Set(updatePaths)))
  }

  const subscribe = (p, cb) => {
    let np = normalizePath(p)
    ;(listeners[np] || (listeners[np] = [])).push(cb)
    return function unsubscribe() {
      listeners[np] = listeners[np].filter((l) => l !== cb)
    }
  }

  const submit = (event) => {
    // eslint-disable-next-line no-unused-vars
    let { isSubmitting, ...status } = getStatus()
    if (config.validate) {
      if (!status.isValid) {
        update(
          status.errorFields
            .concat(status.validatingFields)
            .map((path) => ['touched', path, true])
        )
        return event && event.preventDefault()
      }
    }
    if (config.onSubmit) {
      event && event.type === 'submit' && event.preventDefault()
      update([['', 'isSubmitting', true]])
      return Promise.resolve(
        config.onSubmit(state.values, {
          reset: (_values) => reset(_values ?? state.values),
          ...status,
        })
      ).finally(() => update([['', 'isSubmitting', false]]))
    }
  }

  setConfig(initialConfig)
  reset(initialValues)

  return {
    getField,
    getStatus,
    reset,
    setConfig,
    submit,
    subscribe,
    update,
  }
}
