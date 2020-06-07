import randomColor from 'randomcolor'

const SKIP_VALUE = 4

export function generateColors (count, seed, offset = 0) {
  return randomColor({
    count: count * SKIP_VALUE,
    seed: seed,
  }).filter((entry, idx) => (idx - offset) % SKIP_VALUE === 0)
}

// src: https://css-tricks.com/snippets/javascript/lighten-darken-color/
export function lightenDarkenColor (col, amt) {
  let usePound = false

  if (col[0] === '#') {
    col = col.slice(1)
    usePound = true
  }

  const num = parseInt(col, 16)

  let r = (num >> 16) + amt

  if (r > 255) r = 255
  else if (r < 0) r = 0

  let b = ((num >> 8) & 0x00FF) + amt

  if (b > 255) b = 255
  else if (b < 0) b = 0

  let g = (num & 0x0000FF) + amt

  if (g > 255) g = 255
  else if (g < 0) g = 0

  return (usePound ? '#' : '') + String('000000' + (g | (b << 8) | (r << 16)).toString(16)).slice(-6)
}
