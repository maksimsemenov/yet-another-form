import { memoise } from './memoise.js'

export const nestedPathRegExp = /[[.]+/

/**
 * @param {string} path
 * @returns string
 */
const _normalizePath = (path) => path.replace(/\[/g, '.').replace(/]/g, '')

export const normalizePath = memoise(_normalizePath)
