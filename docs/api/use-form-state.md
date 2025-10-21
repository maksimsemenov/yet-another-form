# useFormState

The `useFormState` hook returns the current form state without providing setters.

## Import

```js
import { useFormState } from 'yet-another-form/react'
```

## Usage

Must be used within a `<Form>` component or with manually passed form context:

```jsx
// Inside Form component
function SubmitButton() {
  const { isDirty, isValid, isSubmitting } = useFormState()

  return (
    <button disabled={!isDirty || !isValid || isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </button>
  )
}

// With manual context
const { formContext } = useForm()
const formState = useFormState(formContext)
```

## Arguments

### `formContext`

- **Type:** `FormContext`
- **Optional**

Form context for using the hook outside the `<Form>` component.

```jsx
const { formContext } = useForm()
const state = useFormState(formContext)
```

## Return Value

### `isDirty`

- **Type:** `boolean`

Whether any field has been changed from its initial value.

```jsx
const { isDirty } = useFormState()
console.log(isDirty) // true/false
```

### `isSubmitting`

- **Type:** `boolean`

Whether the form is currently submitting.

```jsx
const { isSubmitting } = useFormState()
{
  isSubmitting && <Spinner />
}
```

### `isValid`

- **Type:** `boolean`

Whether the form has no errors.

```jsx
const { isValid } = useFormState()
console.log(isValid) // true/false
```

### `dirtyFields`

- **Type:** `string[]`
- **Auto-subscribable**

Array of field names that have been changed.

```jsx
const { dirtyFields } = useFormState()
console.log(dirtyFields) // ['name', 'email']
```

::: info Auto-Subscribable
If you don't read this property, your component won't re-render when it changes.
:::

### `errorFields`

- **Type:** `string[]`
- **Auto-subscribable**

Array of field names that have errors.

```jsx
const { errorFields } = useFormState()
console.log(errorFields) // ['email']
```

::: info Auto-Subscribable
If you don't read this property, your component won't re-render when it changes.
:::

### `validatingFields`

- **Type:** `string[]`
- **Auto-subscribable**

Array of field names currently being validated (async validation).

```jsx
const { validatingFields } = useFormState()
{
  validatingFields.length > 0 && <Spinner />
}
```

::: info Auto-Subscribable
If you don't read this property, your component won't re-render when it changes.
:::

## Examples

### Submit Button

```jsx
function SubmitButton() {
  const { isDirty, isValid, isSubmitting } = useFormState()

  return (
    <button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save Changes'}
    </button>
  )
}
```

### Form Status Display

```jsx
function FormStatus() {
  const state = useFormState()

  return (
    <div className="form-status">
      {state.isDirty && <span>You have unsaved changes</span>}
      {state.errorFields.length > 0 && (
        <span>Please fix {state.errorFields.length} error(s)</span>
      )}
      {state.validatingFields.length > 0 && (
        <span>Validating {state.validatingFields.join(', ')}...</span>
      )}
    </div>
  )
}
```

### Conditional Rendering

```jsx
function FormActions() {
  const { isDirty, isValid } = useFormState()

  if (!isDirty) {
    return <p>No changes to save</p>
  }

  return (
    <div>
      <button type="submit" disabled={!isValid}>
        Save
      </button>
      <button type="reset">Cancel</button>
    </div>
  )
}
```

### Progress Indicator

```jsx
function FormProgress() {
  const { errorFields, validatingFields } = useFormState()

  return (
    <div>
      {validatingFields.length > 0 && (
        <div className="validating">
          Validating: {validatingFields.join(', ')}
        </div>
      )}
      {errorFields.length > 0 && (
        <div className="errors">Errors in: {errorFields.join(', ')}</div>
      )}
    </div>
  )
}
```

## Use Case

The `useFormState` hook is useful when:

- You only need to read form state without modifying it
- You want to create separate components for form controls
- You need to display form status or progress
- You want to conditionally render based on form state

## Comparison with useForm

| Feature                      | `useForm`       | `useFormState`           |
| ---------------------------- | --------------- | ------------------------ |
| Returns setters              | ✅              | ❌                       |
| Returns Form component       | ✅              | ❌                       |
| Returns state                | ✅              | ✅                       |
| Can be used in Form children | ❌              | ✅                       |
| Requires form context        | ❌ (creates it) | ✅ (must be inside Form) |

## TypeScript

```tsx
interface FormState {
  isDirty: boolean
  isSubmitting: boolean
  isValid: boolean
  dirtyFields: string[]
  errorFields: string[]
  validatingFields: string[]
}

function useFormState(formContext?: FormContext): FormState
```
