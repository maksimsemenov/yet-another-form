import * as React from 'react'
import { useForm } from '../../react'
import { DeepPartial } from '../../utils/types'

const initialValues = { name: '', address: { state: 'NJ', city: '' } }

const validate = (values: DeepPartial<typeof initialValues>) => {
  return {
    name: values.name ? undefined : 'Name is required',
    address: {
      state: values.address?.state ? undefined : 123,
      city: values.address?.city ? undefined : 'City is required',
    },
  }
}

export const App = () => {
  const { Form, values, setValue, setTouched } = useForm({
    initialValues,
    // THROWS Type '(values: DeepPartial<typeof initialValues>) => { name: string | undefined; address: { state: number | undefined; city: string | undefined; }; }' is not assignable to type '(values: DeepPartial<{ name: string; address: { state: string; city: string; }; }>) => DeepPartial<VariableDeepMap<{ name: string; address: { state: string; city: string; }; }, string | undefined>> | Promise<...>'
    validate,
  })

  const reset = () => {
    // THROWS No overload matches this call
    setValue({ someOtherValues: 'value' })
  }

  return (
    <Form>
      <input
        name="name"
        // THROWS Argument of type 'string' is not assignable to parameter of type '"address" | "name" | "address.state" | "address.city"'.
        onChange={(e) => setValue(e.target.value, 'name')}
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
