# Field-Level Validation

Example demonstrating field-level validation using the `useFormField` hook.

## Demo

```jsx
import { useForm, useFormField } from 'yet-another-form/react'

function TextField({ name, label, type = 'text', validate }) {
  const field = useFormField(name, { validate })

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        value={field.value || ''}
        onChange={field.setValue}
        onBlur={field.setTouched}
        className={field.touched && field.error ? 'error' : ''}
      />
      {field.touched && field.error && (
        <span className="error-message">{field.error}</span>
      )}
      {field.isValidating && <span className="validating">Validating...</span>}
    </div>
  )
}

function SignupForm() {
  const { Form } = useForm({
    onSubmit: (values) => {
      alert(`Welcome, ${values.username}!`)
    },
  })

  return (
    <Form>
      <TextField
        name="username"
        label="Username"
        validate={(value) => {
          if (!value) return 'Username is required'
          if (value.length < 3) return 'Must be at least 3 characters'
          if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Only letters, numbers, and underscores allowed'
          }
        }}
      />

      <TextField
        name="email"
        label="Email"
        type="email"
        validate={(value) => {
          if (!value) return 'Email is required'
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Invalid email address'
          }
        }}
      />

      <TextField
        name="age"
        label="Age"
        type="number"
        validate={(value) => {
          if (!value) return 'Age is required'
          const age = parseInt(value, 10)
          if (age < 13) return 'Must be at least 13 years old'
          if (age > 120) return 'Please enter a valid age'
        }}
      />

      <button type="submit">Sign Up</button>
    </Form>
  )
}
```

## Reusable Field Component

Create a reusable field component with built-in validation display:

```jsx
function FormField({ name, label, type = 'text', validate, ...props }) {
  const field = useFormField(name, { validate })

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {validate && <span className="required">*</span>}
      </label>

      <input
        id={name}
        type={type}
        value={field.value || ''}
        onChange={field.setValue}
        onBlur={field.setTouched}
        aria-invalid={field.touched && !!field.error}
        aria-describedby={field.error ? `${name}-error` : undefined}
        {...props}
      />

      {field.isValidating && (
        <span className="field-status validating">Checking...</span>
      )}

      {field.touched && field.error && (
        <span id={`${name}-error`} className="field-status error">
          {field.error}
        </span>
      )}

      {field.isDirty && !field.error && !field.isValidating && (
        <span className="field-status success">✓</span>
      )}
    </div>
  )
}
```

## Cross-Field Validation

Validate a field based on other field values:

```jsx
function PasswordFields() {
  const { Form, values } = useForm()

  return (
    <Form>
      <TextField
        name="password"
        label="Password"
        type="password"
        validate={(value) => {
          if (!value) return 'Password is required'
          if (value.length < 8) return 'Must be at least 8 characters'
          if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter'
          if (!/[a-z]/.test(value)) return 'Must contain lowercase letter'
          if (!/[0-9]/.test(value)) return 'Must contain a number'
        }}
      />

      <TextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        validate={(value, formValues) => {
          if (!value) return 'Please confirm your password'
          if (value !== formValues.password) {
            return 'Passwords do not match'
          }
        }}
      />
    </Form>
  )
}
```

## Async Field Validation

Validate field asynchronously (e.g., check username availability):

```jsx
const checkUsername = async (username) => {
  const response = await fetch(`/api/check-username/${username}`)
  const { available } = await response.json()
  return available
}

function UsernameField() {
  const field = useFormField('username', {
    validate: async (value) => {
      if (!value) return 'Username is required'
      if (value.length < 3) return 'Too short'

      const isAvailable = await checkUsername(value)
      if (!isAvailable) {
        return 'Username is already taken'
      }
    },
  })

  return (
    <div>
      <label>Username</label>
      <input
        value={field.value || ''}
        onChange={field.setValue}
        onBlur={field.setTouched}
      />
      {field.isValidating && <span>Checking...</span>}
      {field.touched && field.error && <span>{field.error}</span>}
    </div>
  )
}
```

## Custom Validation Messages

Create a validator factory for common validations:

```jsx
const validators = {
  required:
    (message = 'This field is required') =>
    (value) => {
      return value ? undefined : message
    },

  minLength: (length, message) => (value) => {
    if (!value) return undefined
    return value.length >= length
      ? undefined
      : message || `Must be at least ${length} characters`
  },

  maxLength: (length, message) => (value) => {
    if (!value) return undefined
    return value.length <= length
      ? undefined
      : message || `Must be no more than ${length} characters`
  },

  pattern: (regex, message) => (value) => {
    if (!value) return undefined
    return regex.test(value) ? undefined : message
  },

  email:
    (message = 'Invalid email address') =>
    (value) => {
      if (!value) return undefined
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message
    },
}

// Combine multiple validators
const composeValidators =
  (...validators) =>
  (value, formValues) => {
    for (const validator of validators) {
      const error = validator(value, formValues)
      if (error) return error
    }
  }

// Usage
function EmailField() {
  const field = useFormField('email', {
    validate: composeValidators(
      validators.required('Email is required'),
      validators.email('Please enter a valid email'),
      validators.maxLength(100)
    ),
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

## Field Array Validation

Validate items in an array:

```jsx
function TodoList() {
  const { Form, values } = useForm({
    initialValues: {
      todos: ['', '', ''],
    },
  })

  return (
    <Form>
      {values.todos.map((_, index) => (
        <TextField
          key={index}
          name={`todos[${index}]`}
          label={`Todo ${index + 1}`}
          validate={(value) => {
            if (!value) return 'Todo cannot be empty'
            if (value.length > 100) return 'Too long (max 100 chars)'
          }}
        />
      ))}
      <button type="submit">Save Todos</button>
    </Form>
  )
}
```

## Conditional Validation

Only validate when certain conditions are met:

```jsx
function ShippingForm() {
  const { Form, values } = useForm()

  return (
    <Form>
      <label>
        <input
          type="checkbox"
          name="differentShippingAddress"
          onChange={setValue}
          checked={values.differentShippingAddress || false}
        />
        Use different shipping address
      </label>

      {values.differentShippingAddress && (
        <TextField
          name="shippingAddress"
          label="Shipping Address"
          validate={(value) => {
            // Only validates when checkbox is checked
            if (!value) return 'Shipping address is required'
          }}
        />
      )}
    </Form>
  )
}
```
