declare module 'yet-another-form/react' {
  import React = require('react')
  import { FormConfig, FormContext, FormStatus } from 'yet-another-form/core'
  import {
    DeepMap,
    DeepPartial,
    DeepPathMap,
    Values,
    DeepValueByPath,
  } from 'yet-another-form/types'

  interface UseForm<T extends object> extends FormStatus {
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
    values: DeepPartial<T>

    /**
     * Form validation errors
     */
    errors: DeepPartial<DeepMap<T, string | undefined>>

    /**
     * Form touched statuses
     */
    touched: DeepPartial<DeepMap<T, boolean>>

    /**
     * Sets value for the form or a particular field
     */
    setValue(event: React.ChangeEvent<HTMLInputElement>): void
    setValue(
      value: React.ChangeEvent<HTMLInputElement> | unknown,
      fieldPath: Values<DeepPathMap<T>>
    ): void
    setValue(
      fieldPath: Values<DeepPathMap<T>>
    ): (value: React.ChangeEvent<HTMLInputElement> | unknown) => void
    setValue(values: DeepPartial<T>): void

    /**
     * Sets error for the form or a particular field
     */
    setError(
      error: string | undefined | unknown,
      fieldPath: Values<DeepPathMap<T>>
    ): void
    setError(errors: DeepPartial<DeepMap<T, string | undefined>>): void
    setError(
      fieldPath: Values<DeepPathMap<T>>
    ): (error: string | undefined | unknown) => void

    /**
     * Sets tocuhed value for the form or a particular field
     */
    setTouched(event: React.FocusEvent<HTMLInputElement>): void
    setTouched(
      touched: string | undefined | unknown,
      fieldPath: Values<DeepPathMap<T>>
    ): void
    setTouched(touched: DeepPartial<DeepMap<T, boolean>>): void
    setTouched(
      fieldPath: Values<DeepPathMap<T>>
    ): (touched: string | undefined | unknown) => void

    /**
     * Submits the form
     */
    submit: (event?: Event) => void

    /**
     * Form store, in case you need to pass it to other hooks manually
     */
    formContext: FormContext<T>
  }

  export function useForm<T extends object = {}>(
    config?: FormConfig<T>
  ): UseForm<T>

  interface UseFormField<T extends object, P> {
    /**
     * Field error, if any
     */
    error: DeepMap<DeepValueByPath<T, P>, string | undefined>

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
    touched: DeepMap<DeepValueByPath<T, P>, boolean>

    /**
     * Value of the field
     */
    value: DeepValueByPath<T, P>

    /**
     * Sets error for the field
     */
    setError: (
      error:
        | DeepMap<DeepValueByPath<T, P>, string | undefined>
        | Promise<DeepMap<DeepValueByPath<T, P>, string | undefined>>
    ) => void

    /**
     * Sets whether the field was touched or not
     */
    setTouched(touched: DeepMap<DeepValueByPath<T, P>, boolean>): void
    setTouched(touched: React.FocusEvent<HTMLInputElement>): void

    /**
     * Sets field value
     */
    setValue(value: React.ChangeEvent<HTMLInputElement>): void
    setValue(value: DeepValueByPath<T, P>): void
  }

  export function useFormField<T extends object, P = Values<DeepPathMap<T>>>(
    fieldPath: P,
    options?: {
      formContext?: FormContext<T>
      validate?: (
        value: DeepValueByPath<T, P>,
        values: DeepPartial<T>
      ) =>
        | DeepMap<DeepValueByPath<T, P>, string | undefined>
        | undefined
        | Promise<
            DeepMap<DeepValueByPath<T, P>, string | undefined> | undefined
          >
    }
  ): UseFormField<T, P>

  export function useFormStatus(formContext: FormContext): FormStatus
}
