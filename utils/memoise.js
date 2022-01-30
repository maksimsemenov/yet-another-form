export const memoise = (fn) => {
  const cache = new Map()
  return (...args) => {
    if (!cache.has(args[0])) {
      cache.set(args[0], fn(...args))
    }
    return cache.get(args[0])
  }
}
