import { pathToArray } from './pathToArray.js'
import { nestedPathRegExp } from './path.js'

export const get = (source, path) => {
  if (source == null || !path) return path ? undefined : source
  if (!nestedPathRegExp.test(path)) return source[path]
  let pathArray = pathToArray(path),
    current = source

  for (let i = 0; i < pathArray.length; i++) {
    current = current[pathArray[i]]
    if (!current && i !== pathArray.length - 1) return undefined
  }
  return current
}
