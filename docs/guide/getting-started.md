# Getting Started

## Installation

Install `yet-another-form` using your preferred package manager:

::: code-group

```bash [npm]
npm install yet-another-form
```

```bash [yarn]
yarn add yet-another-form
```

```bash [pnpm]
pnpm add yet-another-form
```

:::

## Your First Form

The simplest way to create a form is to use the `useForm` hook:

```jsx
import { useForm } from 'yet-another-form/react'

function MyForm() {
  const { Form, setValue, values } = useForm({
    onSubmit: (values) => {
      console.log('Form submitted:', values)
    },
  })

  return (
    <Form>
      <input name="name" onChange={setValue} value={values.name || ''} />
      <input name="email" onChange={setValue} value={values.email || ''} />
      <button type="submit">Submit</button>
    </Form>
  )
}
```

## How it Works

1. **Create the form** - `useForm()` returns everything you need to manage form state
2. **Wrap your form** - Use the `<Form>` component to provide context
3. **Connect inputs** - Use `setValue` for onChange and `values` to display current values
4. **Handle submission** - Pass `onSubmit` to the hook configuration

## What You Get

The `useForm` hook returns:

- `Form` - A component that wraps your form elements
- `values` - Current form values as an object
- `setValue` - Function to update field values
- `setError` - Function to set validation errors
- `setTouched` - Function to mark fields as touched
- `isDirty` - Boolean indicating if any field changed
- `isValid` - Boolean indicating if form has no errors
- `isSubmitting` - Boolean indicating submission state

## Next Steps

Now that you have a basic form working, you can:

- Add [validation](/guide/validation) to your forms
- Learn about [form submission](/guide/submission) handling
- Explore the [API reference](/api/use-form)
- Check out more [examples](/examples/basic)
