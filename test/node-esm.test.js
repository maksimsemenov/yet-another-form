import { execFileSync } from 'child_process'

test('Node loads the published entry points as native ES modules', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const core = await import('yet-another-form/core')
       const react = await import('yet-another-form/react')
       console.log(typeof core.createFormStore, typeof react.useForm)`,
    ],
    { encoding: 'utf8' }
  )
  expect(output.trim()).toBe('function function')
})
