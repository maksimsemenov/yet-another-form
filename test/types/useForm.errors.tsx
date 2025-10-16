import * as React from 'react'
import { useForm } from '../../react'

const initialValues = { name: '', address: { state: 'NJ', city: '' } }

export const App = () => {
  const { Form, values, setValue, setTouched } = useForm({
    initialValues,
  })

  const reset = () => {
    // THROWS No overload matches this call
    setValue({ someOtherValues: 'value' })
  }

  return (
    <Form>
      <input
        name="name"
        onChange={setValue}
        // THROWS Property 'names' does not exist on type 'DeepPartial<{ name: string; address: { state: string; city: string; }; }>'. Did you mean 'name'?
        value={values.names}
        onBlur={setTouched}
      />
      <input
        name="address.city"
        // THROWS No overload matches this call
        onChange={setValue('address.cities')}
        onBlur={setTouched('address.city')}
        value={values.address?.city}
      />
    </Form>
  )
}
