import { useState, useRef, useEffect } from 'react'

export const useGetters = (target, path, keys, store, comparator, keyNames) => {
  let [, rerender] = useState(),
    stateRef = useRef()
  if (!stateRef.current)
    stateRef.current = {
      values: store.getField(path),
      subscribe: new Set(),
      getters: {},
    }

  const getterFactory = (key) =>
    stateRef.current.getters[key] ||
    (stateRef.current.getters[key] = () => {
      stateRef.current.subscribe.add(key)
      return stateRef.current.values[key]
    })

  useEffect(
    () =>
      store.subscribe(path, (values) => {
        let shouldRerender = keys.some(
          (key) =>
            stateRef.current.subscribe.has(key) &&
            (comparator
              ? !comparator(stateRef.current.values[key], values[key])
              : stateRef.current.values[key] !== values[key])
        )
        stateRef.current.values = values
        if (shouldRerender) {
          rerender({})
        }
      }),
    []
  )
  return keys.reduce((accum, key, index) => {
    Object.defineProperty(accum, keyNames ? keyNames[index] : key, {
      get: getterFactory(key),
      enumerable: true,
    })
    return accum
  }, target)
}
