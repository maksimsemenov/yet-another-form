/**
 * Object that contains current form status properties.
 */
export interface FormStatus {
  dirtyFields: string[]
  errorFields: string[]
  isSubmitting: boolean
  isValidating: boolean
  isValid: boolean
  isDirty: boolean
  validatingFields: string[]
}

/**
 * An object with form status properties and reset method.
 */
export interface FormSubmitBag<T extends Record<string, unknown> = {}>
  extends Omit<FormStatus, 'isSubmitting'> {
  /**
   * Resets the form: clears dirty field, run validation if needed, sets
   * new initial values to passed values. If no values are passed, it will
   * set form initial values, to latest form values (the ones, that was
   * submitted).
   */
  reset: (values?: Partial<T>) => void
}

export interface FormConfig<T extends Record<string, unknown> = {}> {
  /**
   * Debounce period (ms) for form validation. If set, valdiation will run not
   * on every change, but just once in a defined period.
   */
  debounceValidation: number
  /**
   * Initial values for the form. Those will be checked, to defined, if form
   * is dirty or not.
   */
  initialValues?: Partial<T>

  /**
   * Is called when form is submitted: either the HTML `<form>`
   * element is submitted, or `formContext.submit` is called.
   */
  onSubmit?: (
    values: Partial<T>,
    formSubmitBag: FormSubmitBag<T>
  ) => void | Promise<void>

  /**
   * Validates the form. By default will be run after each value change. Can be
   * debounced through `debounceValidation` prop.
   */
  validate?: (
    values: Partial<T>
  ) => Record<string, unknown> | Promise<Record<string, unknown>>
}

export interface FieldStatus<V = unknown> {
  value: V
  error: string | undefined | boolean | Record<string, unknown>
  touched: boolean | Record<string, unknown>
  isValidating: boolean
  isDirty: boolean
}

export interface FormContext<T extends Record<string, unknown> = {}> {
  /**
   * Returns value of the specified field. If no path is specified
   * it will return the form root values
   */
  getField: (path: string) => FieldStatus

  /**
   * Returns form status
   */
  getStatus: () => FormStatus

  /**
   * Resets the form: clears dirty field, run validation if needed, sets
   * new initial values if they passed. If no values are passed, it will
   * reset to the form original initial values (the ones that were passed
   * in form config).
   */
  reset: (newValues: Partial<T>) => void

  /**
   * Updates form config.
   */
  setConfig: (newConfig: Omit<FormConfig<T>, 'initialValues'>) => void

  /**
   * Submits the form.
   */
  submit: (event?: Event) => void

  /**
   * Subscribes to the form updates. Will return an unsubscribe method.
   */
  subscribe: (path: string, callback: (value: unknown) => void) => () => void

  /**
   * Updates form state.
   */
  update: (
    pathces: [
      key: 'values' | 'touched' | 'fieldErrors',
      path: string,
      value: unknown
    ][]
  ) => void
}

export function createFormStore<T extends Record<string, unknown> = {}>(
  config: FormConfig<T>
): FormContext<T>
