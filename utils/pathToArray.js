import { memoise } from './memoise.js'

const segmentRegexp = /(\d+)$|[.[]?(\d+)[.\]]|[.[]?([^.[\]]+)[.\]]?/g

export const pathToArray = memoise((path) => {
  if (!path) return []
  if (typeof path !== 'string') throw new Error('Path must be a string')

  let pathArray = []
  path.replace(segmentRegexp, (_, d1, d2, s) => {
    if (d1 || d2) pathArray.push(parseInt(d1 || d2, 10))
    if (s) pathArray.push(s)
  })

  return pathArray
})
