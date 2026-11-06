import sharp from 'sharp'

type TemplateImageInput = {
  title: string
  slug: string
  category?: string
}

type RGB = [number, number, number]

type Palette = {
  dark: RGB
  middle: RGB
  light: RGB
  glow: RGB
  accents: RGB[]
}

/**
 * A selection of palettes inspired by the reference thumbnails.
 *
 * Each article gets a consistent palette based on its slug.
 */
const PALETTES: Palette[] = [
  {
    // Purple background with a yellow glow
    dark: [60, 49, 113],
    middle: [110, 102, 158],
    light: [204, 208, 233],
    glow: [255, 191, 20],
    accents: [
      [72, 56, 139],
      [225, 225, 246],
      [126, 114, 180],
    ],
  },
  {
    // Purple background with a green glow
    dark: [105, 48, 109],
    middle: [165, 113, 167],
    light: [224, 211, 237],
    glow: [119, 226, 90],
    accents: [
      [105, 52, 120],
      [235, 208, 235],
      [164, 116, 183],
    ],
  },
  {
    // Teal background with a coral glow
    dark: [0, 103, 102],
    middle: [69, 160, 150],
    light: [190, 224, 210],
    glow: [255, 125, 105],
    accents: [
      [0, 112, 109],
      [241, 146, 127],
      [92, 176, 157],
    ],
  },
  {
    // Pink background with an orange glow
    dark: [151, 75, 139],
    middle: [184, 132, 183],
    light: [229, 218, 241],
    glow: [255, 112, 52],
    accents: [
      [244, 184, 227],
      [151, 115, 182],
      [215, 165, 209],
    ],
  },
  {
    // Red background with an amber glow
    dark: [127, 48, 66],
    middle: [182, 102, 111],
    light: [244, 218, 210],
    glow: [255, 177, 0],
    accents: [
      [240, 190, 179],
      [159, 72, 91],
      [255, 221, 194],
    ],
  },
  {
    // Green background with a coral glow
    dark: [71, 111, 48],
    middle: [127, 155, 91],
    light: [213, 224, 197],
    glow: [250, 122, 96],
    accents: [
      [64, 117, 51],
      [242, 140, 105],
      [200, 215, 166],
    ],
  },
  {
    // Blue background with a pink glow
    dark: [54, 81, 150],
    middle: [96, 145, 200],
    light: [198, 219, 238],
    glow: [249, 100, 165],
    accents: [
      [50, 78, 143],
      [244, 139, 187],
      [135, 179, 222],
    ],
  },
]

/**
 * Produces a stable unsigned number from a string.
 */
function hash(value: string): number {
  let result = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }

  return result >>> 0
}

/**
 * Returns a deterministic number between 0 and 1.
 */
function random(seed: number, key: string): number {
  // Mix all bits so neighbouring keys do not produce clustered positions.
  let value = hash(`${seed}:${key}`)
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b)
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

function mixColor(from: RGB, to: RGB, amount: number): RGB {
  const t = clamp(amount)

  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ]
}

function adjustBrightness(color: RGB, amount: number): RGB {
  return [
    Math.round(clamp(color[0] + amount, 0, 255)),
    Math.round(clamp(color[1] + amount, 0, 255)),
    Math.round(clamp(color[2] + amount, 0, 255)),
  ]
}

function rgb(color: RGB): string {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

/**
 * Creates a left-to-right background gradient.
 *
 * Unlike a normal SVG gradient, every tile gets its own calculated
 * color. This keeps the entire image visibly pixelated.
 */
function backgroundColor(palette: Palette, horizontalPosition: number): RGB {
  if (horizontalPosition < 0.55) {
    return mixColor(
      palette.dark,
      palette.middle,
      horizontalPosition / 0.55,
    )
  }

  return mixColor(
    palette.middle,
    palette.light,
    (horizontalPosition - 0.55) / 0.45,
  )
}

export async function generateTemplateImage(input: TemplateImageInput) {
  const width = 1200
  const height = 630

  // 32 columns gives approximately the same pixel size as the reference.
  const columns = 32
  const tileSize = width / columns
  const rows = Math.ceil(height / tileSize)

  const seed = hash(`${input.slug}:${input.category || ''}`)

  const palette = PALETTES[seed % PALETTES.length]

  /**
   * Move the glow between images while keeping it inside the canvas.
   * Coordinates are measured in pixels.
   */
  const glowX = width * (0.28 + random(seed, 'glow-x') * 0.45)
  const glowY = height * (0.3 + random(seed, 'glow-y') * 0.4)

  // Controls the size and softness of the colored glow.
  const glowRadius = width * 0.105

  const tiles: string[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * tileSize
      const y = row * tileSize

      const centerX = x + tileSize / 2
      const centerY = y + tileSize / 2

      const horizontalPosition = centerX / width

      // Base background color changes gradually from left to right.
      let color = backgroundColor(palette, horizontalPosition)

      // Add a subtle vertical change so the image feels less flat.
      const verticalBrightness = (0.5 - centerY / height) * 8

      // Small tile-to-tile changes keep the grid visible.
      const tileVariation =
        (random(seed, `tile-${row}-${column}`) - 0.5) * 5

      color = adjustBrightness(
        color,
        verticalBrightness + tileVariation,
      )

      /**
       * Gaussian falloff creates the soft glow.
       *
       * Since the color is calculated once per tile, the glow stays
       * pixelated instead of becoming a smooth blurry circle.
       */
      const distance = Math.hypot(
        centerX - glowX,
        centerY - glowY,
      )

      const glowStrength = Math.exp(
        -(distance * distance) / (2 * glowRadius * glowRadius),
      )

      color = mixColor(color, palette.glow, glowStrength * 0.92)

      tiles.push(
        `<rect x="${x}" y="${y}" width="${tileSize + 0.15}" height="${tileSize + 0.15}" fill="${rgb(color)}"/>`,
      )
    }
  }

  /**
   * Add a small number of isolated squares, like the reference.
   * Their positions are deterministic for each article.
   */
  const accentSquares: string[] = []
  const accentCount = 7

  for (let index = 0; index < accentCount; index += 1) {
    // Spread accents across distinct columns and keep them inside the canvas.
    const column = 2 + index * 4 + Math.floor(random(seed, `accent-x-${index}`) * 3)
    const row = 1 + Math.floor(random(seed, `accent-y-${index}`) * (Math.floor(height / tileSize) - 2))
    const accentColors: RGB[] = [
      adjustBrightness(palette.dark, -22),
      mixColor(palette.light, [255, 240, 209], 0.55),
      palette.accents[0],
    ]
    const color = accentColors[index % accentColors.length]
    const opacity = 0.78 + random(seed, `accent-opacity-${index}`) * 0.16

    accentSquares.push(
      `<rect
        x="${column * tileSize}"
        y="${row * tileSize}"
        width="${tileSize}"
        height="${tileSize}"
        fill="${rgb(color)}"
        opacity="${opacity.toFixed(2)}"
      />`,
    )
  }

  const svg = `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="${width}"
        height="${height}"
        fill="${rgb(palette.dark)}"
      />

      ${tiles.join('')}

      ${accentSquares.join('')}
    </svg>
  `

  const data = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer()

  return {
    data,
    mimeType: 'image/png',
  }
}
