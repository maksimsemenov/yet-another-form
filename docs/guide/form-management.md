# Form Management

## Setting Values

The `setValue` function is versatile and supports multiple usage patterns:

### Direct Event Handler

The most common usage - pass it directly to `onChange`:

```jsx
<input name="email" onChange={setValue} value={values.email || ''} />
```

### Programmatic Updates

Set values programmatically with field path and value:

```jsx
setValue('email', 'user@example.com')
```

### Curried Function

Create a setter for a specific field:

```jsx
const setEmail = setValue('email')
setEmail('user@example.com')
```

### Nested Values

Use dot notation for nested objects:

```jsx
<input
  name="address.city"
  onChange={setValue}
  value={values.address?.city || ''}
/>
```

### Array Values

Use bracket notation for arrays:

```jsx
<input
  name="items[0].title"
  onChange={setValue}
  value={values.items?.[0]?.title || ''}
/>
```

## Initial Values

Set initial values when creating the form:

```jsx
const { Form, values } = useForm({
  initialValues: {
    name: 'John Doe',
    email: 'john@example.com',
  },
})
```

### Resetting on Initial Values Change

When `initialValues` changes, the form automatically resets:

```jsx
const { Form } = useForm({
  initialValues: userProfile, // When userProfile changes, form resets
})
```

::: tip
Initial values are compared deeply, so you don't need to memoize them. However, using `useMemo` might improve performance in some cases.
:::

## Resetting the Form

Use the `reset` function to restore form to initial state:

```jsx
const { Form, reset, values } = useForm({
  initialValues: { name: '', email: '' },
  onSubmit: (values, { reset }) => {
    api.submitForm(values)
    reset() // Clear form after submission
  },
})
```

### Reset with New Values

Pass new initial values when resetting:

```jsx
reset({ name: 'New Name', email: 'new@email.com' })
```

## Tracking Changes

### isDirty Flag

Check if any field has been modified:

```jsx
const { Form, isDirty } = useForm()

return (
  <Form>
    {/* ... fields ... */}
    <button disabled={!isDirty}>Save Changes</button>
  </Form>
)
```

### Dirty Fields List

Get a list of all modified fields:

```jsx
const { dirtyFields } = useForm()

console.log(dirtyFields) // ['name', 'email']
```

::: info Auto-Subscribable
`dirtyFields` is auto-subscribable. If you don't read it from the hook, your component won't re-render when it changes.
:::

## Managing Touched State

Mark fields as touched (usually on blur):

```jsx
const { Form, setTouched, values } = useForm()

return (
  <Form>
    <input
      name="email"
      value={values.email || ''}
      onChange={setValue}
      onBlur={setTouched} // Marks field as touched on blur
    />
  </Form>
)
```

### Programmatic Touch

```jsx
setTouched('email', true) // Mark as touched
setTouched('email', false) // Mark as untouched
```

### Curried Version

```jsx
const touchEmail = setTouched('email')
touchEmail(true)
```

## Form State Access

Access the complete form state with `useFormState`:

```jsx
import { useFormState } from 'yet-another-form/react'

function SubmitButton() {
  const { isDirty, isValid, isSubmitting } = useFormState()

  return (
    <button disabled={!isDirty || !isValid || isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </button>
  )
}
```

::: tip
`useFormState` must be used within a `<Form>` component or you need to pass the form context manually.
:::
