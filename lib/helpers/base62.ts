const CHARSET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
    ""
  )

export function toBase62(integer: number) {
  if (integer === 0) {
    return "0"
  }

  const chars = []
  while (integer > 0) {
    chars.push(CHARSET[integer % 62])
    integer = Math.floor(integer / 62)
  }

  return chars.join("")
}
