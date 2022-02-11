declare module 'yet-another-form/types' {
  // MIT License

  // Copyright (c) Diego Haz

  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:

  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.

  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  // SOFTWARE.

  // Most of those awsome typings was copied from a wonderful reakit package:
  // https://github.com/reakit/reakit

  /**
   * Creates an array like object with specified length
   * @template N Length
   */
  export type ArrayWithLength<N extends number> = { [K in N]: any }

  /**
   * ["foo", "bar", 0, "baz"]
   * @template T Object with keys { foo: { bar: [{ baz }] } }
   * @template P Path ["foo", "bar", 0, "baz"]
   */
  export interface DeepPathArray<T, P> extends ReadonlyArray<any> {
    ['0']?: keyof T
    ['1']?: P extends {
      ['0']: infer K0
    }
      ? K0 extends keyof T
        ? keyof T[K0]
        : never
      : never
    ['2']?: P extends {
      ['0']: infer K0
      ['1']: infer K1
    }
      ? K0 extends keyof T
        ? K1 extends keyof T[K0]
          ? keyof T[K0][K1]
          : never
        : never
      : never
    ['3']?: P extends {
      ['0']: infer K0
      ['1']: infer K1
      ['2']: infer K2
    }
      ? K0 extends keyof T
        ? K1 extends keyof T[K0]
          ? K2 extends keyof T[K0][K1]
            ? keyof T[K0][K1][K2]
            : never
          : never
        : never
      : never
    ['4']?: P extends {
      ['0']: infer K0
      ['1']: infer K1
      ['2']: infer K2
      ['3']: infer K3
    }
      ? K0 extends keyof T
        ? K1 extends keyof T[K0]
          ? K2 extends keyof T[K0][K1]
            ? K3 extends keyof T[K0][K1][K2]
              ? keyof T[K0][K1][K2][K3]
              : never
            : never
          : never
        : never
      : never
    ['5']?: P extends {
      ['0']: infer K0
      ['1']: infer K1
      ['2']: infer K2
      ['3']: infer K3
      ['4']: infer K4
    }
      ? K0 extends keyof T
        ? K1 extends keyof T[K0]
          ? K2 extends keyof T[K0][K1]
            ? K3 extends keyof T[K0][K1][K2]
              ? K4 extends keyof T[K0][K1][K2][K3]
                ? keyof T[K0][K1][K2][K3][K4]
                : never
              : never
            : never
          : never
        : never
      : never
  }

  /**
   * Returns the value within T object based on given array path
   * @template T Object with keys { foo: { bar: [{ baz }] } }
   * @template P Path ["foo", "bar", 0, "baz"]
   */
  export type DeepPathArrayValue<
    T,
    P extends DeepPathArray<T, P>
  > = P extends ArrayWithLength<0 | 1 | 2 | 3 | 4 | 5 | 6>
    ? any
    : P extends ArrayWithLength<0 | 1 | 2 | 3 | 4 | 5>
    ? T[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]]
    : P extends ArrayWithLength<0 | 1 | 2 | 3 | 4>
    ? T[P[0]][P[1]][P[2]][P[3]][P[4]]
    : P extends ArrayWithLength<0 | 1 | 2 | 3>
    ? T[P[0]][P[1]][P[2]][P[3]]
    : P extends ArrayWithLength<0 | 1 | 2>
    ? T[P[0]][P[1]][P[2]]
    : P extends ArrayWithLength<0 | 1>
    ? T[P[0]][P[1]]
    : P extends ArrayWithLength<0>
    ? T[P[0]]
    : never

  /**
   * DeepPath argument
   * @template T Object with keys { foo: { bar: [{ baz }] } }
   * @template P ["foo", "bar", 0, "baz"] or "foo"
   */
  export type DeepPath<T, P> = DeepPathArray<T, P> | keyof T

  /**
   * DeepPath return
   * @template T Object with keys { foo: { bar: [{ baz }] } }
   * @template P ["foo", "bar", 0, "baz"] or "foo"
   */
  export type DeepPathValue<
    T,
    P extends DeepPath<T, P>
  > = P extends DeepPathArray<T, P>
    ? DeepPathArrayValue<T, P>
    : P extends keyof T
    ? T[P]
    : any

  /**
   * @template T Object
   * @template V Value
   */
  export type DeepMap<T, V> = {
    [K in keyof T]: T[K] extends Array<infer U> | undefined
      ? U extends object
        ? Array<DeepMap<U, V>>
        : object extends U
        ? Array<DeepMap<U, V>>
        : Array<V>
      : T[K] extends object
      ? DeepMap<T[K], V>
      : object extends T[K]
      ? DeepMap<T[K], V>
      : V
  }

  /**
   * @template T Object
   */
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends string | number | boolean | Function
      ? T[P]
      : DeepPartial<T[P]>
  }

  export type Values<T> = T extends object ? T[keyof T] : never

  export type DeepPathMap<T> = T extends object
    ? {
        [P in keyof T]: P extends string
          ? T[P] extends Array<infer U>
            ? `${P}.${number}` | `${P}.${number}.${Values<DeepPathMap<U>>}`
            : T[P] extends object
            ? P | `${P}.${Values<DeepPathMap<T[P]>>}`
            : P
          : never
      }
    : never

  //
  // WIP
  export type DeepValueByPath<
    T extends object,
    P
  > = P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}.${infer K4}.${infer K5}.${infer K6}`
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? K3 extends keyof T[K0][K1][K2]
            ? K4 extends keyof T[K0][K1][K2][K3]
              ? K5 extends keyof T[K0][K1][K2][K3][K4]
                ? K6 extends keyof T[K0][K1][K2][K3][K4][K5]
                  ? T[K0][K1][K2][K3][K4][K5][K6]
                  : never
                : never
              : never
            : never
          : never
        : never
      : never
    : P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}.${infer K4}.${infer K5}`
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? K3 extends keyof T[K0][K1][K2]
            ? K4 extends keyof T[K0][K1][K2][K3]
              ? K5 extends keyof T[K0][K1][K2][K3][K4]
                ? T[K0][K1][K2][K3][K4][K5]
                : never
              : never
            : never
          : never
        : never
      : never
    : P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}.${infer K4}`
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? K3 extends keyof T[K0][K1][K2]
            ? K4 extends keyof T[K0][K1][K2][K3]
              ? T[K0][K1][K2][K3][K4]
              : never
            : never
          : never
        : never
      : never
    : P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}`
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? K3 extends keyof T[K0][K1][K2]
            ? T[K0][K1][K2][K3]
            : never
          : never
        : never
      : never
    : P extends `${infer K0}.${infer K1}.${infer K2}`
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? T[K0][K1][K2]
          : never
        : never
      : never
    : P extends `${infer K0}.${infer K1}`
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? T[K0][K1]
        : never
      : never
    : P extends keyof T
    ? T[P]
    : unknown

  type RestrictName<P, T> = P extends { name: unknown }
    ? Omit<P, 'name'> & { name: Values<DeepPathMap<T>> }
    : P & { name: Values<DeepPathMap<T>> }
}

declare module 'yet-another-form/core' {
  import { DeepMap, DeepPartial } from 'yet-another-form/types'
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
  export interface FormSubmitBag<T extends object = {}>
    extends Omit<FormStatus, 'isSubmitting'> {
    /**
     * Resets the form: clears dirty field, run validation if needed, sets
     * new initial values to passed values. If no values are passed, it will
     * set form initial values, to latest form values (the ones, that was
     * submitted).
     */
    reset: (values?: Partial<T>) => void
  }

  export interface FormConfig<T extends object = {}> {
    /**
     * Debounce period (ms) for form validation. If set, valdiation will run not
     * on every change, but just once in a defined period.
     */
    debounceValidation?: number
    /**
     * Initial values for the form. Those will be checked, to defined, if form
     * is dirty or not.
     */
    initialValues?: DeepPartial<T>

    /**
     * Is called when form is submitted: either the HTML `<form>`
     * element is submitted, or `formContext.submit` is called.
     */
    onSubmit?: (
      values: DeepPartial<T>,
      formSubmitBag: FormSubmitBag<T>
    ) => void | Promise<void>

    /**
     * Validates the form. By default will be run after each value change. Can be
     * debounced through `debounceValidation` prop.
     */
    validate?: (
      values: DeepPartial<T>
    ) =>
      | DeepPartial<DeepMap<T, string | undefined>>
      | Promise<DeepPartial<DeepMap<T, string | undefined>>>
  }

  export interface FieldStatus<V = unknown> {
    value: V
    error: string | undefined | boolean | object
    touched: boolean | object
    isValidating: boolean
    isDirty: boolean
  }

  export interface FormContext<T extends object = {}> {
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

  export function createFormStore<T extends object = {}>(
    config: FormConfig<T>
  ): FormContext<T>
}

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
