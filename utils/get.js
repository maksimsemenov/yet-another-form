import { pathToArray } from './pathToArray.js'
import { nestedPathRegExp } from './path.js'

export const get = (source, path) => {
  if (source == null || !path) return path ? undefined : source
  if (!nestedPathRegExp.test(path)) return source[path]
  let current = source
  for (let key of pathToArray(path)) {
    if (!current) return
    current = current[key]
  }
  return current
}
