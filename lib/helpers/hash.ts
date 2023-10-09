import { toBase62 } from "./base62"

/**
 * Adapted from
 * https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 *
 * Copyright (c) 2023 bryc
 *
 * License: Public domain. Attribution appreciated. The original cyrb53 has a
 * slight mixing bias in the low bits of h1. This shouldn't be a huge problem,
 * but I want to try to improve it. This new version should have improved
 * avalanche behavior, but it is not quite final, I may still find improvements.
 * So don't expect it to always produce the same output.
 */

/**
 * Hashes the provided value to a short string. Generally things won't collide,
 * but collisions do happen, that's the difference between hashing and
 * compression.
 */
export function hash(value: unknown, seed = 0) {
  const str =
    typeof value === "string"
      ? value
      : typeof value === "object"
      ? JSON.stringify(value)
      : `${typeof value}(${String(value)})`

  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 0x85ebca77)
    h2 = Math.imul(h2 ^ ch, 0xc2b2ae3d)
  }
  h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97)
  h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xcaf649a9)
  h1 ^= h2 >>> 16
  h2 ^= h1 >>> 16

  const integer = 2097152 * (h2 >>> 0) + (h1 >>> 11)

  return toBase62(integer)
}
