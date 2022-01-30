# Yet Another Form 🤦‍♂️

Yet another form-state management library. There are a bunch of them. This one is another take on this problem.

## Motivation

- Size. The gil was to create the smallest form management library. We use [`size-limit`](https://github.com/ai/size-limit) to check the size of the library after each commit.

---

## Getting started

1. Install the `yet-another-form`

   ```bash
   # npm
   npm install yet-another-form

   #yarn
   yarn add yet-another-form

   #pnpm
   pnpm add yet-another-form
   ```

2. Import `useForm` hook into yor component

   ```jsx
   import { useForm } from 'yet-another-form'

   const AddUser = ({ onAddUser }) => {
     const { Form, setValue, values } = useForm({ onSubmit: onAddUser })

     return (
       <Form>
         <input name="name" onChange={setValue} value={values.name} />
         <input name="email" onChange={setValue} value={values.email} />
         <button>Add user</button>
       </Form>
     )
   }
   ```

---

## Usage

### Validation

`yet-another-form` supports form-level and field-level validations.

#### Form-level validation

To validate on the form-level, you need to pass a `validate` function with the form config. This function will receive the latest form values and should return either an object with errors, or the promise, that resolves to that object, or something in between:

- object with errors
  ```js
  validate(values) {
      return {
          name: values.name ? undefined : 'name is required',
          email: values.email ? undefined : 'email is required',
      }
  }
  ```
- promise
  ```js
  validate(values) {
      return validateUserDataOnServer(values)
  }
  ```
  - while the promise is resolving, the `isValidating` property of form status will be set to `true` and `isValid` will be set to `false`
- something in between
  ```js
  validate(values) {
      return {
          name: values.name ? undefined : 'name is required',
          email: validateEmailOnServer(values.email)
      }
  }
  ```
  - non-async errors will be applied to form state right away
  - while async validations are in progress, the form and fields `isValidating` properties will be set to `true` and `isValid` properties will be `false`
  - for fields with async validation, the previous error will be returned while validation is in progress

Form-level validation runs on each change. But it can be debounced through the `debounce` property in the form config (ms).

#### Field-level validation

For field-level validation, you can pass a validate function (sync or async) to the `useFormField` hook config. The function will receive the field value as the first argument and the latest form values as the second.

### Submission

When the form is submitted, a few things happen:

- it will set `isSubmitting` flag to `true`
- if the form is invalid, it will touch all fields with errors and will prevent form submission
- if the form has an `onSubmit` handler, it will call it, with form values, and a "bag" with form status and `reset` method
- after data was submitted, the `isSubmitting` flag will be set to `false`
- if the form does not have an `onSubmit` handler, it will fall back to default browser behavior for the `<form>` element, i.e., form data will be sent to the provided endpoint, and the browser will reload the page.

---

## API reference

### `useForm`

The `useForm` is the main hook that creates and configures the form store.

```js
const formContext = useForm(config)
```

#### Form config

- `debounceValidation: number` — if set, then form validation will happen only once within the defined period
- `initialValues: any` — default values for the form
- if `initialValues` changes, the form will be reset. Previous and next values are compared deeply, so you don't need to memorize those (use `useMemo`), but the latter might improve performance.
- `onSubmit(values, formBag) => Promise<void> | void` — submit handler. Is called when form is submitted: either the HTML `<form>` element is submitted, or `formContext.submit` is called.

- `formBag` – is an object with a few helpful props and methods:
- `isDirty: boolean` — indicates whether any field was changed or not
- `isValid: boolean` — indicates whether the form has any errors or not
- `dirtyFields: string[]` — list of fields that had been changed - `errorFields: string[]` — list of fields that have errors
- `errorFields: string[]` — list of fields that have errors
- `validatingFields: string[]` — list of fields that are validating (in case of async validation)
- `reset() => void` — resets the form and sets submitted values as default values

- `validate(values) => any | Promise<any>` validation function. It will receive form values and should return an object that contains errors for fields. More about [validation](#validation)

#### Form context

`useForm` hook returns an object with the current form state and several helpers and setters to update the form state.

- `Form: ReactComponent` — thin wrapper around HTML `<form>` element. It wraps `<form>` into form context provider, and "binds" its `onSubmit` handler with the form store
  - all props passed to the `<Form>` component will be passed to the underlying `<form>` element, even `onSubmit`
  - `<Form>` forwards the ref to the underlying `<form>` element, so you can pass react refs to it
- `isDirty: boolean` — indicates whether any field was changed or not
- `isSubmitting: boolean` — indicates whether the form is submitting data
- `isValid: boolean` — indicates whether the form has any errors or not
- `dirtyFields: string[]` — list of fields that had been changed
  - auto-subscribable, which means that if it was not read from the `useForm` hook, the react component will not be updated, if it changes
- `errorFields: string[]` — list of fields that have errors
  - auto-subscribable, which means that if it was not read from the `useForm` hook, the react component will not be updated, if it changes
- `validatingFields: string[]` — list of fields that are validating (in case of async validation)
  - auto-subscribable, which means that if it was not read from the `useForm` hook, the react component will not be updated, if it changes
- `formContext: FormContext` — a form store, in case you need to pass it to other hooks manually
- `setError: function` — sets error for the form or a particular field
  - support several signatures:
    - `(error: string | undefined, fieldPath: string) => void`
    - `(error: Promise<string | undefined>, fieldPath: string) => void`
    - `(fieldPath: string) => (error: string | undefined) => void`
    - `(fieldPath: string) => (error: Promise<string | undefined>) => void`
  - it keeps the reference between rerenders, so it is safe to pass it to `useEffect` or `useCallback`
- `setTouched: function` — sets whether particular field or fields were touched or not
  - support several signatures:
    - `(event: BlurEvent) => void`
    - `(event: BlurEvent, fieldPath: string) => void`
    - `(touched: boolean, fieldPath: string) => void`
    - `(fieldPath: string) => (touched: boolean) => void`
    - `(fieldPath: string) => (event: BlurEvent) => void`
  - can be passed to `onBlur` handler. In this case, will set the touched value to true when input loses focus
  - it keeps the reference between rerenders, so it is safe to pass it to `useEffect` or `useCallback`
- `setValue: function` — sets value for the form or a particular field
  - support several signatures:
    - `(event: ChangeEvent) => void`
    - `(event: ChangeEvent, fieldPath: string) => void`
    - `(value: any, fieldPath: string) => void`
    - `(fieldPath: string) => (event: ChangeEvent) => void`
    - `(fieldPath: string) => (value: any) => void`
  - can be passed to `onChange` handler. In this case, it will try to read the field path from the input name
  - it keeps the reference between rerenders, so it is safe to pass it to `useEffect` or `useCallback`
- `reset(initialValues?: any) => void` — resets the form to its initial values
  - if new values are passed, it will set them as form initial values and will validate the form
- `submit() => void` — submits the form

### `useFormField`

The `useFormField` hook is used to get data and setters for a particular field. It should be used within form context (in a sub-tree of the `Form` component, returned by the `useForm` hook).

If you want to use the `useFormField` hook in the same code block as the `useForm` and not in the `<Form>` sub-tree, you need to pass the `FormContext` to the hook as part of the hook config.

```js
const field = useFormField('address.city')

// or with manually passed form context
const { formContext } = useForm()
const field = useFormField('address', { formContext })
```

#### Arguments

- `path: string`— the path of a particular field in the form state
  - is **required**
  - supports object notation, i.e. `address.city` or `items[0].title`
- `config` — optional hook config
  - `formContext: FormContext` — form context
    - in case `useFormField` hook is used outside form context provider, you need to manually pass form context as a second argument
  - `validate(value: any, formValues: any) => string | undefined | Promise<string | undefined>` — [field-level validation](#field-level-validation) function

#### Field context

`useFormField` hook returns an object with the current field state and several setters to update a field.

- `error: string | undefined` — field error, if any
- `isDirty: boolean` — indicates whether the field was changed or not
- `isValidating: boolean` — indicates whether the field is being validated
- `touched: boolean` — indicates whether the field was touched
- `value: any` — field value
- `setError(error: string | undefined | Primise<string | undefined>` – sets error for the field
  - it keeps the reference between rerenders, so it is safe to pass it to `useEffect` or `useCallback`
- `setTouched(touched: boolean | BlurEvent) => ` — sets whether the field was touched or not
  - can be passed to `onBlur` handler. In this case, will set the touched value to `true`, when input loses focus
  - it keeps the reference between rerenders, so it is safe to pass it to `useEffect` or `useCallback`
- `setValue(value: any | ChangeEvent) => void` — sets value for the field
  - can be passed to `onChange` handler
  - it keeps the reference between rerenders, so it is safe to pass it to `useEffect` or `useCallback`

### `useFormState`

The `useFormState` hook returns a form state. It should be used within form context (in a sub-tree of the `Form` component, returned by the `useForm` hook).

If you want to use the `useFormState` hook in the same code block as the `useForm` and not in the `<Form>` sub-tree, you need to pass the `FormContext` to the hook as its first argument.

```js
const formState = useFormState()

// or with manually passed form context
const { formContext } = useForm()
const formState = useFormState(formContext)
```

#### Arguments

- `formContext: FormContext` — form context
  - optional
  - in case `useFormState` hook is used outside form context provider, you need to manually pass form context to it

#### Form state

`useFormState` hook returns an object with the current form state.

- `isDirty: boolean` — indicates whether any field was changed or not
- `isSubmitting: boolean` — indicates whether the form is submitting data
- `isValid: boolean` — indicates whether the form has any errors or not
- `dirtyFields: string[]` — list of fields that had been changed
  - auto-subscribable, which means that if it was not read from the `useForm` hook, the react component will not be updated, if it changes
- `errorFields: string[]` — list of fields that have errors
  - auto-subscribable, which means that if it was not read from the `useForm` hook, the react component will not be updated, if it changes
- `validatingFields: string[]` — list of fields that are validating (in case of async validation)
  - auto-subscribable, which means that if it was not read from the `useForm` hook, the react component will not be updated, if it changes
