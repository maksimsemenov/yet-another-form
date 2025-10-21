---
layout: home

hero:
  name: Yet Another Form
  text: Minimal and Performant Form State Management
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/maksimsemenov/yet-another-form

features:
  - icon: 📦
    title: Tiny Bundle Size
    details: Focused on being the smallest form management library. Every byte counts!
  - icon: ⚡️
    title: Simple API
    details: Clean and intuitive hooks-based API that feels natural in React applications.
  - icon: ✅
    title: Powerful Validation
    details: Support for both synchronous and asynchronous validation at form and field levels.
  - icon: 🎯
    title: TypeScript Support
    details: Fully typed with comprehensive TypeScript definitions out of the box.
  - icon: 🔄
    title: Auto-Subscribable
    details: Smart re-rendering - components only update when the data they use changes.
  - icon: 🎨
    title: Framework Agnostic Core
    details: Core logic is framework-independent with React bindings included.
---

## Quick Example

```jsx
import { useForm } from 'yet-another-form/react'

const AddUser = ({ onAddUser }) => {
  const { Form, setValue, values } = useForm({
    onSubmit: onAddUser,
  })

  return (
    <Form>
      <input name="name" onChange={setValue} value={values.name} />
      <input name="email" onChange={setValue} value={values.email} />
      <button>Add user</button>
    </Form>
  )
}
```

## Installation

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
