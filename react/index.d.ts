import React = require('react')
import { FormConfig, FormContext, FormStatus } from '../core'

interface UseForm<T extends Record<string, unknown>> extends FormStatus {
  /**
   * Thin wrapper around HTML `<form>` element. It wraps `<form>` into form context provider,
   * and "binds" its `onSubmit` handler with the form store
   */
  Form: React.ForwardRefRenderFunction<
    HTMLFormElement,
    React.HTMLAttributes<HTMLFormElement>
  >
  /**
   * Form values
   */
  values: Partial<T>

  /**
   * Form validation errors
   */
  errors: Record<string, unknown>

  /**
   * Form touched statuses
   */
  touched: Record<string, unknown | boolean>

  /**
   * Sets value for the form or a particular field
   */
  setValue:
    | React.ChangeEventHandler<HTMLInputElement>
    | ((
        value: React.ChangeEvent<HTMLInputElement> | unknown,
        fieldPath: string
      ) => void)
    | ((values: Partial<T>) => void)
    | ((
        fieldPath: string
      ) => (value: React.ChangeEvent<HTMLInputElement> | unknown) => void)

  /**
   * Sets error for the form or a particular field
   */
  setError:
    | ((error: string | undefined | unknown, fieldPath: string) => void)
    | ((errors: Record<string, unknown | string | undefined>) => void)
    | ((fieldPath: string) => (error: string | undefined | unknown) => void)

  /**
   * Sets error for the form or a particular field
   */
  setTouched:
    | ((touched: string | undefined | unknown, fieldPath: string) => void)
    | ((touched: Record<string, unknown | string | undefined>) => void)
    | ((fieldPath: string) => (touched: string | undefined | unknown) => void)

  /**
   * Submits the form
   */
  submit: (event?: Event) => void

  /**
   * Form store, in case you need to pass it to other hooks manually
   */
  formContext: FormContext<T>
}

export function useForm<T extends Record<string, unknown> = {}>(
  config: FormConfig<T>
): UseForm<T>

interface UseFormField<T = unknown> {
  /**
   * Field error, if any
   */
  error: string | undefined | unknown

  /**
   * Indicates whether the field was changed or not
   */
  isDirty: boolean

  /**
   * Indicates whether the field is being validated
   */
  isValidating: boolean

  /**
   * Indicates whether the field was touched
   */
  touched: boolean

  /**
   * Value of the field
   */
  value: T

  /**
   * Sets error for the field
   */
  setError: (
    error: string | undefined | unknown | Promise<string | undefined | unknown>
  ) => void

  /**
   * Sets whether the field was touched or not
   */
  setTouched: (touched: boolean | FocusEvent) => void

  /**
   * Sets field value
   */
  setValue: (value: T | React.ChangeEvent<HTMLInputElement>) => void
}

export function useFormField<
  T = unknown,
  V extends Record<string, unknown> = {}
>(
  fieldPath: string,
  options: {
    formContext: FormContext<V>
    validate: (
      value: T | unknown,
      values: Partial<V>
    ) => string | undefined | unknown | Promise<string | undefined | unknown>
  }
): UseFormField<T>

export function useFormStatus(formContext: FormContext): FormStatus
