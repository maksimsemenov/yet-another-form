import { debounce } from '../utils/debounce.js'
import { flatten } from '../utils/flatten.js'
import { isEqual } from '../utils/isEqual.js'
import { set } from '../utils/set.js'
import { get } from '../utils/get.js'
import { normalizePath } from '../utils/path.js'

export const FORM_STATUS_PATH = '__status__'

export const getFieldsDiff = (fields1 = {}, fields2 = {}) => {
  let fieldsSet = new Set(Object.keys(fields1))
  for (let path in fields2) {
    if (fields1[path] === fields2[path]) fieldsSet.delete(path)
    else fieldsSet.add(path)
  }
  return fieldsSet
}

export const fieldsToArray = (fieldsObject = {}) =>
  Object.keys(fieldsObject).filter((key) => fieldsObject[key])

export const filterMatchingFields = (paths, fields) => {
  fields = [...fields]
  return [...new Set(paths)].filter((path) =>
    fields.some((field) => path.startsWith(field) || field.startsWith(path))
  )
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

  // An empty field error lets the schema error show through
  const setFieldError = (path, error) =>
    error == null ? delete fieldErrors[path] : (fieldErrors[path] = error)

  const processErrors = (validationState) => {
    let flatValidations = {},
      flatErrors = {},
      errors
    for (let [path, error] of Object.entries({
      ...flatten(validationState),
      ...flatten(fieldErrors),
    })) {
      if (error instanceof Promise) {
        flatValidations[path] = error.then(
          fieldErrors[path] === error
            ? // Replaced by its result, so an empty one falls back to the schema
              (result) => {
                if (fieldErrors[path] === error) {
                  setFieldError(path, result)
                  validate(state.values)
                }
              }
            : processAsyncError(path)
        )
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

    let errorsDiff = getFieldsDiff(flatErrors, state.flatErrors)
    // Keeps the reference so subscribers don't re-render when nothing changed
    if (!errorsDiff.size) errors = state.errors

    let updatePaths = new Set([
      FORM_STATUS_PATH,
      ...errorsDiff,
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

  // `quiet` skips the isValidating flag: re-validation after a config change
  // would otherwise re-render on every render for an inline async validate
  const validate = (values, quiet) => {
    let validationState = config.validate?.(values)
    if (
      !validationState &&
      !Object.keys(fieldErrors).length &&
      !state.errors &&
      !fieldsToArray(state.flatValidations).length
    )
      return
    if (validationState instanceof Promise) {
      if (!quiet) {
        state.isValidating = true
        notify([FORM_STATUS_PATH])
      }
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
    let prevValidate = config.validate
    config = newConfig
    debouncedValidate = config.debounceValidation
      ? debounce(validate, config.debounceValidation)
      : validate
    if ('values' in state && config.validate !== prevValidate)
      validate(state.values, true)
  }

  const getField = (name = '') =>
    name === FORM_STATUS_PATH
      ? getStatus()
      : {
          error: get(state.errors, name),
          isDirty: name ? isFieldDirty(name) : undefined,
          isValidating: name
            ? state.isValidating || Boolean(state.flatValidations?.[name])
            : undefined,
          touched: get(state.touched, name) || (name ? false : undefined),
          value: get(state.values, name),
        }

  const getStatus = () => {
    let validatingFields = fieldsToArray(state.flatValidations),
      errorFields = fieldsToArray(state.flatErrors),
      dirtyFields = fieldsToArray(state.dirtyFields)

    let isValidating = state.isValidating || Boolean(validatingFields.length)

    return {
      dirtyFields: dirtyFields,
      errorFields,
      isSubmitting: state.isSubmitting,
      isValidating,
      isValid: !(isValidating || errorFields.length),
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

  const isFieldDirty = (path) =>
    !isEqual(get(state.values, path), get(state.initialValues, path))

  const update = (updates) => {
    let updatePaths = [FORM_STATUS_PATH],
      shouldValidate = false

    updates.forEach(([type, path, value]) => {
      const clearedPath = normalizePath(path)
      if (type) updatePaths.push(clearedPath)

      if (type === 'fieldErrors') {
        shouldValidate = true
        setFieldError(clearedPath, value)
      } else {
        state = set(state, `${type}.${clearedPath}`, value)
      }

      if (type === 'values') {
        shouldValidate = true
        let { dirtyFields } = state
        dirtyFields[clearedPath] = 1
        if (value && typeof value === 'object')
          Object.assign(dirtyFields, flatten(value, clearedPath))
        // Rechecks paths above and below the change; a loose prefix match only costs time
        for (let key in dirtyFields) {
          if (key.startsWith(clearedPath) || clearedPath.startsWith(key))
            dirtyFields[key] = isFieldDirty(key)
        }
      }
    })
    if (shouldValidate) debouncedValidate(state.values)
    notify(filterMatchingFields(Object.keys(listeners), updatePaths))
  }

  const subscribe = (p, cb) => {
    let np = normalizePath(p)
    ;(listeners[np] || (listeners[np] = [])).push(cb)
    return () => {
      listeners[np] = listeners[np].filter((l) => l !== cb)
    }
  }

  const submit = (event) => {
    // eslint-disable-next-line no-unused-vars
    let { isSubmitting, ...status } = getStatus()
    if (config.validate && !status.isValid) {
      update(
        status.errorFields
          .concat(status.validatingFields)
          .map((path) => ['touched', path, true])
      )
      return event?.preventDefault()
    }
    if (config.onSubmit) {
      event?.type === 'submit' && event.preventDefault()
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
