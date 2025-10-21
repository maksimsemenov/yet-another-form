# Form Submission

## Basic Submission

Handle form submission with the `onSubmit` callback:

```jsx
const { Form } = useForm({
  onSubmit: (values) => {
    console.log('Form submitted with:', values)
  },
})
```

## Submission Flow

When a form is submitted, the following happens in order:

1. `isSubmitting` flag is set to `true`
2. If form is invalid, all error fields are touched and submission is prevented
3. If form is valid, `onSubmit` handler is called
4. After `onSubmit` completes, `isSubmitting` is set to `false`

## Form Bag

The `onSubmit` handler receives form values and a "bag" with helpful utilities:

```jsx
const { Form } = useForm({
  onSubmit: (values, formBag) => {
    console.log('Values:', values)
    console.log('Is dirty?', formBag.isDirty)
    console.log('Dirty fields:', formBag.dirtyFields)
    console.log('Error fields:', formBag.errorFields)
    console.log('Validating fields:', formBag.validatingFields)

    // Reset form after submission
    formBag.reset()
  },
})
```

### Form Bag Properties

| Property           | Type       | Description                      |
| ------------------ | ---------- | -------------------------------- |
| `isDirty`          | `boolean`  | Whether any field was changed    |
| `isValid`          | `boolean`  | Whether form has any errors      |
| `dirtyFields`      | `string[]` | Array of changed field names     |
| `errorFields`      | `string[]` | Array of field names with errors |
| `validatingFields` | `string[]` | Array of fields being validated  |
| `reset()`          | `function` | Reset form to initial values     |

## Async Submission

Return a Promise to handle async submission:

```jsx
const { Form } = useForm({
  onSubmit: async (values) => {
    try {
      await api.submitForm(values)
      alert('Form submitted successfully!')
    } catch (error) {
      alert('Submission failed: ' + error.message)
    }
  },
})
```

While the Promise is pending, `isSubmitting` will be `true`.

## Submit Button State

Use submission state to provide feedback:

```jsx
const { Form, isSubmitting, isValid } = useForm({
  onSubmit: async (values) => {
    await api.submitForm(values)
  },
})

return (
  <Form>
    {/* ... fields ... */}
    <button type="submit" disabled={!isValid || isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  </Form>
)
```

## Programmatic Submission

Submit the form programmatically with the `submit` function:

```jsx
const { Form, submit } = useForm({
  onSubmit: (values) => {
    console.log('Submitted:', values)
  },
})

return (
  <div>
    <Form>{/* ... fields ... */}</Form>

    {/* External submit button */}
    <button onClick={submit}>Save</button>
  </div>
)
```

## Reset After Submit

Clear the form after successful submission:

```jsx
const { Form } = useForm({
  onSubmit: async (values, { reset }) => {
    await api.submitForm(values)
    reset() // Clear form
  },
})
```

### Reset with New Values

Set new initial values after submission:

```jsx
const { Form } = useForm({
  onSubmit: async (values, { reset }) => {
    const newData = await api.submitForm(values)
    reset(newData) // Set new data as initial values
  },
})
```

## Native Form Submission

If you don't provide an `onSubmit` handler, the form will use native browser submission:

```jsx
const { Form } = useForm()

return (
  <Form action="/api/submit" method="POST">
    <input name="email" />
    <button type="submit">Submit</button>
  </Form>
)
```

This will:

- Validate the form
- Prevent submission if invalid
- Use standard HTML form submission if valid
- Reload the page (default browser behavior)

## Preventing Submission

Validate before allowing submission:

```jsx
const { Form, isValid } = useForm({
  validate: (values) => ({
    email: values.email ? undefined : 'Email required',
  }),
  onSubmit: (values) => {
    // This only runs if isValid is true
    console.log('Valid data:', values)
  },
})

return (
  <Form>
    {/* ... */}
    <button type="submit" disabled={!isValid}>
      Submit
    </button>
  </Form>
)
```

## Error Handling

Handle submission errors:

```jsx
const { Form, setError } = useForm({
  onSubmit: async (values) => {
    try {
      await api.submitForm(values)
    } catch (error) {
      if (error.field) {
        // Set field-specific error
        setError(error.field, error.message)
      } else {
        // Handle general error
        alert(error.message)
      }
    }
  },
})
```
