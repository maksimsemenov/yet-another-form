# useForm

The `useForm` hook is the main entry point for creating and configuring forms.

## Import

```js
import { useForm } from 'yet-another-form/react'
```

## Usage

```jsx
const formContext = useForm(config)
```

## Configuration

### `debounceValidation`

- **Type:** `number`
- **Default:** `undefined`

Debounce validation in milliseconds. If set, validation will only run once within the specified period.

```jsx
const { Form } = useForm({
  debounceValidation: 300, // Wait 300ms after last change
  validate: (values) => ({
    /* ... */
  }),
})
```

### `initialValues`

- **Type:** `any`
- **Default:** `{}`

Default values for the form.

```jsx
const { Form } = useForm({
  initialValues: {
    name: 'John Doe',
    email: 'john@example.com',
  },
})
```

::: info
If `initialValues` changes, the form will reset. Values are compared deeply, so memoization is optional but may improve performance.
:::

### `onSubmit`

- **Type:** `(values: any, formBag: FormBag) => Promise<void> | void`
- **Default:** `undefined`

Submit handler called when the form is submitted.

```jsx
const { Form } = useForm({
  onSubmit: (values, formBag) => {
    console.log('Submitted:', values)
    formBag.reset()
  },
})
```

#### Form Bag

The second argument contains:

| Property           | Type       | Description                   |
| ------------------ | ---------- | ----------------------------- |
| `isDirty`          | `boolean`  | Whether any field was changed |
| `isValid`          | `boolean`  | Whether form has no errors    |
| `dirtyFields`      | `string[]` | List of changed fields        |
| `errorFields`      | `string[]` | List of fields with errors    |
| `validatingFields` | `string[]` | List of validating fields     |
| `reset()`          | `function` | Reset form to initial values  |

### `validate`

- **Type:** `(values: any) => any | Promise<any>`
- **Default:** `undefined`

Form-level validation function. Receives form values and should return an object with errors.

```jsx
const { Form } = useForm({
  validate: (values) => {
    const errors = {}
    if (!values.email) {
      errors.email = 'Email is required'
    }
    return errors
  },
})
```

Support async validation:

```jsx
const { Form } = useForm({
  validate: async (values) => {
    const errors = await validateOnServer(values)
    return errors
  },
})
```

## Return Value

### `Form`

- **Type:** `React.Component`

A wrapper around the HTML `<form>` element that:

- Provides form context to child components
- Handles form submission
- Forwards all props to underlying `<form>`
- Forwards refs to underlying `<form>`

```jsx
const { Form } = useForm()

<Form className="my-form" onSubmit={customHandler}>
  {/* form fields */}
</Form>
```

### `formContext`

- **Type:** `FormContext`

The form store. Pass this to hooks when using them outside of `<Form>` component.

```jsx
const { formContext } = useForm()
const field = useFormField('email', { formContext })
```

### `values`

- **Type:** `any`

Current form values as an object.

```jsx
const { values } = useForm()
console.log(values.email)
```

### `errors`

- **Type:** `Record<string, string>`

Object containing error messages for each field.

```jsx
const { errors } = useForm()
console.log(errors.email) // 'Email is required'
```

### `isDirty`

- **Type:** `boolean`

Whether any field has been changed.

```jsx
const { isDirty } = useForm()
```

### `isSubmitting`

- **Type:** `boolean`

Whether the form is currently submitting.

```jsx
const { isSubmitting } = useForm()
```

### `isValid`

- **Type:** `boolean`

Whether the form has no errors.

```jsx
const { isValid } = useForm()
```

### `dirtyFields`

- **Type:** `string[]`
- **Auto-subscribable**

Array of field names that have been changed.

```jsx
const { dirtyFields } = useForm()
console.log(dirtyFields) // ['name', 'email']
```

### `errorFields`

- **Type:** `string[]`
- **Auto-subscribable**

Array of field names that have errors.

```jsx
const { errorFields } = useForm()
console.log(errorFields) // ['email']
```

### `validatingFields`

- **Type:** `string[]`
- **Auto-subscribable**

Array of field names currently being validated (async validation).

```jsx
const { validatingFields } = useForm()
console.log(validatingFields) // ['email']
```

### `setValue`

- **Type:** `function`

Sets value for a field. Stable reference between renders.

**Signatures:**

```ts
setValue(event: ChangeEvent) => void
setValue(fieldPath: string, value: any) => void
setValue(fieldPath: string) => (value: any) => void
setValue(fieldPath: string) => (event: ChangeEvent) => void
```

**Usage:**

```jsx
const { setValue } = useForm()

// As event handler
<input name="email" onChange={setValue} />

// Programmatic
setValue('email', 'user@example.com')

// Curried
const setEmail = setValue('email')
setEmail('user@example.com')
```

### `setError`

- **Type:** `function`

Sets error for a field. Stable reference between renders.

**Signatures:**

```ts
setError(fieldPath: string, error: string | undefined) => void
setError(fieldPath: string, error: Promise<string | undefined>) => void
setError(fieldPath: string) => (error: string | undefined) => void
```

**Usage:**

```jsx
const { setError } = useForm()

// Set error
setError('email', 'Invalid email')

// Clear error
setError('email', undefined)

// Async error
setError('email', validateEmailOnServer(email))
```

### `setTouched`

- **Type:** `function`

Sets whether a field was touched. Stable reference between renders.

**Signatures:**

```ts
setTouched(event: BlurEvent) => void
setTouched(fieldPath: string, touched: boolean) => void
setTouched(fieldPath: string) => (touched: boolean) => void
setTouched(fieldPath: string) => (event: BlurEvent) => void
```

**Usage:**

```jsx
const { setTouched } = useForm()

// As event handler
<input onBlur={setTouched} />

// Programmatic
setTouched('email', true)

// Curried
const touchEmail = setTouched('email')
touchEmail(true)
```

### `reset`

- **Type:** `(initialValues?: any) => void`

Resets the form to its initial values.

```jsx
const { reset } = useForm()

// Reset to original initial values
reset()

// Reset with new values
reset({ name: 'New', email: 'new@example.com' })
```

### `submit`

- **Type:** `() => void`

Programmatically submits the form.

```jsx
const { submit } = useForm()

<button onClick={submit}>Submit</button>
```

## TypeScript

```tsx
interface FormConfig<T = any> {
  debounceValidation?: number
  initialValues?: T
  onSubmit?: (values: T, formBag: FormBag) => Promise<void> | void
  validate?: (values: T) => any | Promise<any>
}

interface FormBag {
  isDirty: boolean
  isValid: boolean
  dirtyFields: string[]
  errorFields: string[]
  validatingFields: string[]
  reset: () => void
}
```
