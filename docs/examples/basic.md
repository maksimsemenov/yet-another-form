# Basic Form

A simple contact form demonstrating core functionality.

## Demo

```jsx
import { useForm } from 'yet-another-form/react'

function ContactForm() {
  const { Form, setValue, values } = useForm({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    onSubmit: (values) => {
      alert(`Message from ${values.name} (${values.email}): ${values.message}`)
    },
  })

  return (
    <Form>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={values.name} onChange={setValue} />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={setValue}
        />
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={values.message}
          onChange={setValue}
          rows={4}
        />
      </div>

      <button type="submit">Send Message</button>
    </Form>
  )
}
```

## Key Concepts

### 1. Initialize the Form

```jsx
const { Form, setValue, values } = useForm({
  initialValues: { name: '', email: '', message: '' },
  onSubmit: (values) => {
    // Handle submission
  },
})
```

### 2. Wrap with Form Component

```jsx
<Form>{/* Your inputs */}</Form>
```

### 3. Connect Inputs

```jsx
<input
  name="email" // Field identifier
  value={values.email} // Display current value
  onChange={setValue} // Update on change
/>
```

### 4. Submit

The form automatically submits when:

- User clicks a submit button
- User presses Enter in an input

## With Reset

Add a reset button to clear the form:

```jsx
function ContactForm() {
  const { Form, setValue, values, reset } = useForm({
    initialValues: { name: '', email: '', message: '' },
    onSubmit: (values, { reset }) => {
      alert('Message sent!')
      reset() // Clear form after submission
    },
  })

  return (
    <Form>
      {/* inputs */}

      <div>
        <button type="submit">Send</button>
        <button type="button" onClick={reset}>
          Clear
        </button>
      </div>
    </Form>
  )
}
```

## With Disabled State

Disable submit button until form is filled:

```jsx
function ContactForm() {
  const { Form, setValue, values } = useForm({
    onSubmit: (values) => {
      console.log('Submitted:', values)
    },
  })

  const isFormFilled = values.name && values.email && values.message

  return (
    <Form>
      {/* inputs */}

      <button type="submit" disabled={!isFormFilled}>
        Send Message
      </button>
    </Form>
  )
}
```

## Nested Objects

Handle nested data structures:

```jsx
function UserForm() {
  const { Form, setValue, values } = useForm({
    initialValues: {
      name: '',
      address: {
        street: '',
        city: '',
        zip: '',
      },
    },
    onSubmit: (values) => {
      console.log('User:', values)
    },
  })

  return (
    <Form>
      <input name="name" value={values.name} onChange={setValue} />

      <input
        name="address.street"
        value={values.address?.street || ''}
        onChange={setValue}
      />

      <input
        name="address.city"
        value={values.address?.city || ''}
        onChange={setValue}
      />

      <input
        name="address.zip"
        value={values.address?.zip || ''}
        onChange={setValue}
      />

      <button type="submit">Save</button>
    </Form>
  )
}
```

## Arrays

Handle lists of items:

```jsx
function TodoForm() {
  const { Form, setValue, values } = useForm({
    initialValues: {
      todos: ['', '', ''],
    },
    onSubmit: (values) => {
      console.log('Todos:', values.todos.filter(Boolean))
    },
  })

  return (
    <Form>
      {[0, 1, 2].map((index) => (
        <input
          key={index}
          name={`todos[${index}]`}
          value={values.todos?.[index] || ''}
          onChange={setValue}
          placeholder={`Todo ${index + 1}`}
        />
      ))}

      <button type="submit">Save Todos</button>
    </Form>
  )
}
```
