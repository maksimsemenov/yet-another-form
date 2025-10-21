# useFormField

The `useFormField` hook provides data and setters for a specific form field.

## Import

```js
import { useFormField } from 'yet-another-form/react'
```

## Usage

Must be used within a `<Form>` component or with manually passed form context:

```jsx
// Inside Form component
function EmailField() {
  const field = useFormField('email')

  return (
    <input
      value={field.value || ''}
      onChange={field.setValue}
      onBlur={field.setTouched}
    />
  )
}

// With manual context
const { formContext } = useForm()
const field = useFormField('email', { formContext })
```

## Arguments

### `path`

- **Type:** `string`
- **Required:** `true`

The path to the field in the form state. Supports object notation and array indexing.

```jsx
// Simple field
useFormField('email')

// Nested object
useFormField('address.city')

// Array item
useFormField('items[0].title')
```

### `config`

- **Type:** `object`
- **Optional**

#### `formContext`

- **Type:** `FormContext`

Form context for using the hook outside the `<Form>` component.

```jsx
const { formContext } = useForm()
const field = useFormField('email', { formContext })
```

#### `validate`

- **Type:** `(value: any, formValues: any) => string | undefined | Promise<string | undefined>`

Field-level validation function.

```jsx
const field = useFormField('email', {
  validate: (value, formValues) => {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email'
    }
    return undefined
  },
})
```

Async validation:

```jsx
const field = useFormField('username', {
  validate: async (value) => {
    if (!value) return 'Username is required'
    const isAvailable = await checkUsername(value)
    return isAvailable ? undefined : 'Username taken'
  },
})
```

## Return Value

### `value`

- **Type:** `any`

Current field value.

```jsx
const field = useFormField('email')
console.log(field.value)
```

### `error`

- **Type:** `string | undefined`

Current error message for the field, if any.

```jsx
const field = useFormField('email')
{
  field.error && <span>{field.error}</span>
}
```

### `isDirty`

- **Type:** `boolean`

Whether the field has been changed from its initial value.

```jsx
const field = useFormField('email')
console.log(field.isDirty) // true/false
```

### `isValidating`

- **Type:** `boolean`

Whether the field is currently being validated (async validation only).

```jsx
const field = useFormField('email')
{
  field.isValidating && <span>Validating...</span>
}
```

### `touched`

- **Type:** `boolean`

Whether the field has been touched (usually set on blur).

```jsx
const field = useFormField('email')
{
  field.touched && field.error && <span>{field.error}</span>
}
```

### `setValue`

- **Type:** `function`

Sets the value for this field. Stable reference between renders.

**Signatures:**

```ts
setValue(value: any) => void
setValue(event: ChangeEvent) => void
```

**Usage:**

```jsx
const field = useFormField('email')

// As event handler
<input onChange={field.setValue} />

// Programmatic
field.setValue('user@example.com')
```

### `setError`

- **Type:** `function`

Sets error for this field. Stable reference between renders.

**Signatures:**

```ts
setError(error: string | undefined) => void
setError(error: Promise<string | undefined>) => void
```

**Usage:**

```jsx
const field = useFormField('email')

// Set error
field.setError('Invalid email')

// Clear error
field.setError(undefined)

// Async error
field.setError(validateEmail(field.value))
```

### `setTouched`

- **Type:** `function`

Sets touched state for this field. Stable reference between renders.

**Signatures:**

```ts
setTouched(touched: boolean) => void
setTouched(event: BlurEvent) => void
```

**Usage:**

```jsx
const field = useFormField('email')

// As event handler
<input onBlur={field.setTouched} />

// Programmatic
field.setTouched(true)
```

## Examples

### Basic Field

```jsx
function TextField({ name, label }) {
  const field = useFormField(name)

  return (
    <div>
      <label>{label}</label>
      <input
        value={field.value || ''}
        onChange={field.setValue}
        onBlur={field.setTouched}
      />
      {field.touched && field.error && (
        <span className="error">{field.error}</span>
      )}
    </div>
  )
}
```

### With Validation

```jsx
function EmailField() {
  const field = useFormField('email', {
    validate: (value) => {
      if (!value) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address'
      }
    },
  })

  return (
    <div>
      <input
        type="email"
        value={field.value || ''}
        onChange={field.setValue}
        onBlur={field.setTouched}
      />
      {field.touched && field.error && (
        <span className="error">{field.error}</span>
      )}
      {field.isValidating && <span className="info">Validating...</span>}
    </div>
  )
}
```

### Nested Fields

```jsx
function AddressForm() {
  const street = useFormField('address.street')
  const city = useFormField('address.city')
  const zip = useFormField('address.zip')

  return (
    <div>
      <input value={street.value || ''} onChange={street.setValue} />
      <input value={city.value || ''} onChange={city.setValue} />
      <input value={zip.value || ''} onChange={zip.setValue} />
    </div>
  )
}
```

### Array Fields

```jsx
function ItemsList() {
  const items = [0, 1, 2] // Could be dynamic

  return (
    <div>
      {items.map((index) => {
        const field = useFormField(`items[${index}].title`)

        return (
          <input
            key={index}
            value={field.value || ''}
            onChange={field.setValue}
          />
        )
      })}
    </div>
  )
}
```

## TypeScript

```tsx
function useFormField<T = any>(
  path: string,
  config?: {
    formContext?: FormContext
    validate?: (
      value: T,
      formValues: any
    ) => string | undefined | Promise<string | undefined>
  }
): {
  value: T
  error?: string
  isDirty: boolean
  isValidating: boolean
  touched: boolean
  setValue: (value: T | ChangeEvent) => void
  setError: (error: string | undefined | Promise<string | undefined>) => void
  setTouched: (touched: boolean | BlurEvent) => void
}
```
