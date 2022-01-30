import { memoise } from './memoise'

export const nestedPathRegExp = /[[.]+/

/**
 * @param {string} path
 * @returns string
 */
const _normalizePath = (path) =>
  path.includes('[') ? path.replace(/\[/g, '.').replace(/]/g, '') : path

export const normalizePath = memoise(_normalizePath)
