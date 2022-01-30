export const isEqual = (v1, v2) => {
  if (v1 === v2) return true
  if (!v1 || typeof v1 !== 'object') return v1 === v2
  if (!v2 || typeof v2 !== 'object') return false
  if (Array.isArray(v1) !== Array.isArray(v2)) return false

  let keys1 = Object.keys(v1)
  if (keys1.length !== Object.keys(v2).length) return false
  for (let key of keys1) {
    if (!isEqual(v1[key], v2[key])) return false
  }
  return true
}
