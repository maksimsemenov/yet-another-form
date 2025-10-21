# What is Yet Another Form?

Yet Another Form is a minimal form state management library for React that prioritizes size and simplicity.

## Motivation

There are many form libraries out there. Yet Another Form focuses on a few key metrics:

- bundle size
- performance
- minimal, yet powerful API.

## Key Features

### 🎯 Minimal API Surface

The library exposes just three hooks:

- `useForm` - for creating and configuring forms
- `useFormField` - for managing individual fields
- `useFormState` - for accessing form state

### 📦 Small Bundle Size

Every feature is carefully evaluated for its size impact. The library aims to be the smallest complete form solution available.

### ⚡️ Performance Optimized

- **Auto-subscribable properties** - Components only re-render when they read data that changes
- **Debounced validation** - Control when validation runs to avoid excessive computation
- **Stable references** - Setters maintain their references between renders

### ✅ Complete Validation Support

- Form-level validation
- Field-level validation
- Synchronous and asynchronous validation
- Mixed validation (some sync, some async)

### 🔄 Flexible State Management

- Nested object paths (`address.city`)
- Array notation (`items[0].title`)

## When to Use

**Use Yet Another Form when:**

- Bundle size is critical to your application
- You want a simple, hooks-based API
- You need both simple and complex validation
- You prefer libraries that do one thing well

**Consider alternatives when:**

- You need complex multi-step wizards
- You require extensive plugin ecosystems
- Bundle size is not a concern
