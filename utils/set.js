import { pathToArray } from './pathToArray.js'

const setIn = (target, index, path, value) => {
  let segment = path[index]
  let newValue =
    index < path.length - 1
      ? setIn(target && target[segment], index + 1, path, value)
      : value

  if (typeof segment === 'string') {
    return typeof target === 'object' && !Array.isArray(target)
      ? { ...target, [segment]: newValue }
      : { [segment]: newValue }
  }

  if (Array.isArray(target)) {
    let array = [...target]
    array.splice(segment, 1, newValue)
    return array
  }

  return [...Array(segment), newValue]
}

export const set = (target, path, value) => {
  return setIn(target, 0, pathToArray(path), value)
}
