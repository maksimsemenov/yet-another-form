# Form Validation

Example demonstrating synchronous form-level validation.

## Demo

```jsx
import { useForm } from 'yet-another-form/react'

function SignupForm() {
  const { Form, setValue, values, setTouched, errors } = useForm({
    validate: (values) => {
      const errors = {}

      // Name validation
      if (!values.name) {
        errors.name = 'Name is required'
      } else if (values.name.length < 2) {
        errors.name = 'Name must be at least 2 characters'
      }

      // Email validation
      if (!values.email) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email address'
      }

      // Password validation
      if (!values.password) {
        errors.password = 'Password is required'
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters'
      }

      // Confirm password validation
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }

      return errors
    },
    onSubmit: (values) => {
      alert(`Account created for ${values.email}!`)
    },
  })

  const [touched, setTouched] = React.useState({})

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
  }

  return (
    <Form>
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          value={values.name || ''}
          onChange={setValue}
          onBlur={() => handleBlur('name')}
        />
        {touched.name && errors.name && (
          <span className="error">{errors.name}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email || ''}
          onChange={setValue}
          onBlur={() => handleBlur('email')}
        />
        {touched.email && errors.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password *</label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password || ''}
          onChange={setValue}
          onBlur={() => handleBlur('password')}
        />
        {touched.password && errors.password && (
          <span className="error">{errors.password}</span>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword || ''}
          onChange={setValue}
          onBlur={() => handleBlur('confirmPassword')}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit">Create Account</button>
    </Form>
  )
}
```

## Validation Rules

### Name

- Required
- Minimum 2 characters

### Email

- Required
- Must be valid email format

### Password

- Required
- Minimum 8 characters

### Confirm Password

- Required
- Must match password

## Key Concepts

### Return Errors Object

```jsx
validate: (values) => {
  const errors = {}

  if (!values.email) {
    errors.email = 'Email is required'
  }

  return errors
}
```

### Show Errors on Touch

```jsx
{
  touched.email && errors.email && <span className="error">{errors.email}</span>
}
```

### Cross-Field Validation

```jsx
if (values.password !== values.confirmPassword) {
  errors.confirmPassword = 'Passwords do not match'
}
```

## With Submit Button State

```jsx
import { useFormState } from 'yet-another-form/react'

function SubmitButton() {
  const { isValid, isDirty } = useFormState()

  return (
    <button type="submit" disabled={!isValid || !isDirty}>
      Create Account
    </button>
  )
}

function SignupForm() {
  const { Form, setValue, values } = useForm({
    validate: (values) => {
      // validation logic
    },
  })

  return (
    <Form>
      {/* fields */}
      <SubmitButton />
    </Form>
  )
}
```

## Conditional Validation

```jsx
validate: (values) => {
  const errors = {}

  // Always validate email
  if (!values.email) {
    errors.email = 'Email is required'
  }

  // Only validate shipping address if different from billing
  if (values.differentShippingAddress) {
    if (!values.shippingAddress) {
      errors.shippingAddress = 'Shipping address is required'
    }
  }

  return errors
}
```

## Validation with Error Count

```jsx
function SignupForm() {
  const { Form, setValue, values, errorFields } = useForm({
    validate: (values) => {
      // validation logic
    },
  })

  return (
    <Form>
      {/* fields */}

      {errorFields.length > 0 && (
        <div className="error-summary">
          Please fix {errorFields.length} error
          {errorFields.length > 1 ? 's' : ''}
        </div>
      )}

      <button type="submit">Create Account</button>
    </Form>
  )
}
```
