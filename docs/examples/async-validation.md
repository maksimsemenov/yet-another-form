# Async Validation

Example demonstrating asynchronous validation with server-side checks.

## Demo

```jsx
import { useForm } from 'yet-another-form/react'

// Simulated API calls
const checkUsernameAvailability = async (username) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const taken = ['admin', 'user', 'test']
  return !taken.includes(username.toLowerCase())
}

const checkEmailAvailability = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  const taken = ['admin@example.com', 'user@example.com']
  return !taken.includes(email.toLowerCase())
}

function RegistrationForm() {
  const { Form, setValue, values, errors, setTouched, validatingFields } =
    useForm({
      debounceValidation: 500, // Wait 500ms before validating
      validate: async (values) => {
        const errors = {}

        // Synchronous validation
        if (!values.username) {
          errors.username = 'Username is required'
        } else if (values.username.length < 3) {
          errors.username = 'Username must be at least 3 characters'
        } else {
          // Async validation - check availability
          const isAvailable = await checkUsernameAvailability(values.username)
          if (!isAvailable) {
            errors.username = 'Username is already taken'
          }
        }

        if (!values.email) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          errors.email = 'Invalid email address'
        } else {
          // Async validation - check availability
          const isAvailable = await checkEmailAvailability(values.email)
          if (!isAvailable) {
            errors.email = 'Email is already registered'
          }
        }

        return errors
      },
      onSubmit: (values) => {
        alert(`Registration successful for ${values.username}!`)
      },
    })

  return (
    <Form>
      <div>
        <label htmlFor="username">Username *</label>
        <input
          id="username"
          name="username"
          value={values.username || ''}
          onChange={setValue}
          onBlur={setTouched}
        />
        {validatingFields.includes('username') && (
          <span className="info">Checking availability...</span>
        )}
        {errors.username && !validatingFields.includes('username') && (
          <span className="error">{errors.username}</span>
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
          onBlur={setTouched}
        />
        {validatingFields.includes('email') && (
          <span className="info">Checking availability...</span>
        )}
        {errors.email && !validatingFields.includes('email') && (
          <span className="error">{errors.email}</span>
        )}
      </div>

      <button type="submit">Register</button>
    </Form>
  )
}
```

## Key Features

### Debounced Validation

```jsx
const { Form } = useForm({
  debounceValidation: 500, // Wait 500ms after typing stops
  validate: async (values) => {
    // Expensive async validation
  },
})
```

This prevents excessive API calls while the user is typing.

### Async Validation Function

```jsx
validate: async (values) => {
  const errors = {}

  if (values.email) {
    const isAvailable = await checkEmailAvailability(values.email)
    if (!isAvailable) {
      errors.email = 'Email is already taken'
    }
  }

  return errors
}
```

### Validation State Indicators

```jsx
{
  validatingFields.includes('username') && <span>Checking availability...</span>
}

{
  errors.username && !validatingFields.includes('username') && (
    <span className="error">{errors.username}</span>
  )
}
```

## Mixed Sync/Async Validation

Combine immediate and delayed validation:

```jsx
const { Form } = useForm({
  debounceValidation: 500,
  validate: (values) => {
    return {
      // Sync validation - immediate feedback
      username: !values.username
        ? 'Username is required'
        : values.username.length < 3
        ? 'Too short'
        : undefined,

      // Async validation - server check
      email: values.email
        ? checkEmailAvailability(values.email).then((available) =>
            available ? undefined : 'Email is taken'
          )
        : 'Email is required',
    }
  },
})
```

## Global Validation Indicator

Show when any field is validating:

```jsx
function RegistrationForm() {
  const { Form, setValue, values, validatingFields } = useForm({
    debounceValidation: 500,
    validate: async (values) => {
      // validation logic
    },
  })

  return (
    <Form>
      {validatingFields.length > 0 && (
        <div className="global-indicator">
          🔄 Validating {validatingFields.join(', ')}...
        </div>
      )}

      {/* form fields */}
    </Form>
  )
}
```

## Submit Button During Validation

```jsx
import { useFormState } from 'yet-another-form/react'

function SubmitButton() {
  const { isValid, validatingFields } = useFormState()
  const isValidating = validatingFields.length > 0

  return (
    <button type="submit" disabled={!isValid || isValidating}>
      {isValidating ? 'Validating...' : 'Register'}
    </button>
  )
}
```

## Error Handling

Handle API errors during validation:

```jsx
validate: async (values) => {
  const errors = {}

  try {
    const isAvailable = await checkEmailAvailability(values.email)
    if (!isAvailable) {
      errors.email = 'Email is already registered'
    }
  } catch (error) {
    errors.email = 'Could not verify email. Please try again.'
  }

  return errors
}
```

## Performance Tips

1. **Use debouncing** for async validation to reduce API calls
2. **Check sync rules first** before making async calls
3. **Cancel previous requests** if implementing your own debounce
4. **Cache results** for previously validated values
5. **Provide immediate feedback** for sync validations

```jsx
// Good: Sync validation first, then async
validate: async (values) => {
  const errors = {}

  if (!values.email) {
    errors.email = 'Required' // Immediate
  } else if (!/^[^\s@]+@/.test(values.email)) {
    errors.email = 'Invalid format' // Immediate
  } else {
    // Only check server if format is valid
    const available = await checkEmail(values.email)
    if (!available) {
      errors.email = 'Email taken' // After server responds
    }
  }

  return errors
}
```
