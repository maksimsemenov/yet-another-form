import * as React from 'react'
import { useForm } from 'yet-another-form/react'

const initialValues = { name: '', address: { state: 'NJ', city: '' } }

export const App = () => {
  const { Form, values, setValue, setTouched } = useForm({
    initialValues,
  })

  const reset = () => {
    setValue(initialValues)
  }

  return (
    <Form>
      <input
        name="name"
        onChange={setValue}
        value={values.name}
        onBlur={setTouched}
      />
      <input
        name="address.city"
        onChange={setValue('address.city')}
        onBlur={() => setTouched('address.city', true)}
        value={values.address?.city}
      />
    </Form>
  )
}
