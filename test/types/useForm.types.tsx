import * as React from 'react'
import { useForm, useFormField } from 'yet-another-form/react'

interface FormValues {
  name: string
  address: {
    address1: string
    city: string
    state: string
    zip: string
  }
  email: string
  questions: {
    question: string
    answer: string
  }[]
}

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
        onBlur={setTouched('address.city')}
        value={values.address?.city}
      />
    </Form>
  )
}
