# Validation

Yet Another Form supports both form-level and field-level validation, with full support for asynchronous validation.

## Form-Level Validation

Validate the entire form by passing a `validate` function to the form config:

```jsx
const { Form } = useForm({
  validate: (values) => {
    const errors = {}

    if (!values.name) {
      errors.name = 'Name is required'
    }

    if (!values.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Invalid email address'
    }

    return errors
  },
})
```

### How It Works

- The `validate` function receives the current form values
- Return an object where keys are field names and values are error messages
- Return `undefined` or empty string for fields with no errors
- Validation runs on each value change

## Async Validation

Return a Promise to validate asynchronously:

```jsx
const { Form } = useForm({
  validate: async (values) => {
    const errors = {}

    // Check if email is available
    if (values.email) {
      const isAvailable = await checkEmailAvailability(values.email)
      if (!isAvailable) {
        errors.email = 'Email is already taken'
      }
    }

    return errors
  },
})
```

### Validation State

While async validation is in progress:

- `isValidating` is set to `true`
- `isValid` is set to `false`
- Previous errors remain visible

## Mixed Validation

Combine synchronous and asynchronous validation:

```jsx
const { Form } = useForm({
  validate: (values) => {
    return {
      // Sync validation - shows immediately
      name: values.name ? undefined : 'Name is required',

      // Async validation - shows after promise resolves
      email: validateEmailOnServer(values.email),
    }
  },
})
```

Benefits:

- Synchronous errors appear immediately
- Asynchronous validation runs in parallel
- Previous async errors remain visible during validation

## Debounced Validation

Control how often validation runs:

```jsx
const { Form } = useForm({
  debounceValidation: 300, // Wait 300ms after last change
  validate: async (values) => {
    // Expensive validation only runs after user stops typing
    return await validateOnServer(values)
  },
})
```

::: tip
Debouncing is especially useful for async validation to avoid excessive API calls.
:::

## Field-Level Validation

Validate individual fields using `useFormField`:

```jsx
import { useFormField } from 'yet-another-form/react'

function EmailField() {
  const field = useFormField('email', {
    validate: (value, formValues) => {
      if (!value) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address'
      }
      return undefined
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
    </div>
  )
}
```

### Field Validation Arguments

The validate function receives:

1. `value` - Current field value
2. `formValues` - Complete form state (for cross-field validation)

### Async Field Validation

```jsx
const field = useFormField('username', {
  validate: async (value) => {
    if (!value) return 'Username is required'

    const isAvailable = await checkUsername(value)
    return isAvailable ? undefined : 'Username is taken'
  },
})
```

## Displaying Errors

### Access Errors

```jsx
const { Form, errors, errorFields } = useForm({
  validate: (values) => ({
    /* ... */
  }),
})

// errors object contains all error messages
console.log(errors.email) // 'Invalid email address'

// errorFields is an array of field names with errors
console.log(errorFields) // ['email', 'name']
```

### Show Errors on Touch

```jsx
function FormField({ name, label }) {
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

### Manual Error Setting

Set errors programmatically:

```jsx
const { Form, setError } = useForm()

// Set error for a field
setError('email', 'This email is invalid')

// Clear error
setError('email', undefined)

// Async error
setError('username', checkUsernameAvailability(username))
```

## Validation on Submit

When the form is submitted:

1. Validation runs (if not already valid)
2. If invalid, all fields with errors are touched
3. Submit is prevented if form is invalid
4. `onSubmit` only fires if form is valid

```jsx
const { Form } = useForm({
  validate: (values) => {
    // Validation runs before submit
    return {
      /* errors */
    }
  },
  onSubmit: (values) => {
    // Only called if validation passes
    console.log('Valid data:', values)
  },
})
```
