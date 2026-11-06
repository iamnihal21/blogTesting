import sharp from 'sharp'

type TemplateImageInput = {
  title: string
  slug: string
  category?: string
}

const palettes = [
  { background: '#171D2E', glow: '#54D6C5', accent: '#F5A66F', soft: '#CDEFEA', ink: '#F8FAF7' },
  { background: '#261B35', glow: '#B89AF4', accent: '#F7C86B', soft: '#E7DBFF', ink: '#FFF9F0' },
  { background: '#102A31', glow: '#66C7D4', accent: '#EE8068', soft: '#C9F1F0', ink: '#FAFBF5' },
  { background: '#302119', glow: '#E28A5A', accent: '#72C8C0', soft: '#F5D8BF', ink: '#FFF9F2' },
  { background: '#192B24', glow: '#92C96E', accent: '#F2B968', soft: '#DDF0CE', ink: '#FCFFF8' },
]

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapTitle(title: string, maximumCharacters = 22, maximumLines = 4) {
  const words = title.trim().split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maximumCharacters || !current) {
      current = candidate
      continue
    }
    lines.push(current)
    current = word
    if (lines.length === maximumLines - 1) break
  }

  const consumed = lines.join(' ').split(/\s+/).filter(Boolean).length
  const remainingWords = words.slice(consumed)
  if (lines.length < maximumLines && remainingWords.length) {
    let finalLine = remainingWords.join(' ')
    if (finalLine.length > maximumCharacters + 5) {
      finalLine = `${finalLine.slice(0, maximumCharacters + 2).trimEnd()}…`
    }
    lines.push(finalLine)
  } else if (current && lines.length < maximumLines) {
    lines.push(current)
  }

  return lines.slice(0, maximumLines)
}

function pixelTiles(seed: number, colours: string[]) {
  const tiles: string[] = []
  for (let row = 0; row < 7; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      const value = hash(`${seed}-${row}-${column}`)
      if (value % 5 === 0) continue
      const x = 786 + column * 58
      const y = 104 + row * 58
      const colour = colours[value % colours.length]
      const opacity = 0.16 + (value % 5) * 0.08
      tiles.push(`<rect x="${x}" y="${y}" width="59" height="59" fill="${colour}" opacity="${opacity.toFixed(2)}"/>`)
    }
  }
  return tiles.join('')
}

export async function generateTemplateImage(input: TemplateImageInput) {
  const seed = hash(`${input.slug}:${input.category || ''}`)
  const palette = palettes[seed % palettes.length]
  const lines = wrapTitle(input.title)
  const fontSize = lines.length <= 2 ? 66 : lines.length === 3 ? 56 : 49
  const lineHeight = Math.round(fontSize * 1.08)
  const titleStartY = 268 - ((lines.length - 1) * lineHeight) / 2
  const category = (input.category || 'Material Mate Guide').toUpperCase()
  const titleSvg = lines.map((line, index) => (
    `<text x="82" y="${titleStartY + index * lineHeight}" class="title">${escapeXml(line)}</text>`
  )).join('')
  const tileColours = [palette.glow, palette.accent, palette.soft, '#FFFFFF']

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="${palette.glow}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.13"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.03"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
        <style>
          .brand { font: 700 28px Arial, Helvetica, sans-serif; letter-spacing: -0.8px; fill: ${palette.ink}; }
          .category { font: 700 16px Arial, Helvetica, sans-serif; letter-spacing: 3px; fill: ${palette.soft}; }
          .title { font: 700 ${fontSize}px Arial, Helvetica, sans-serif; letter-spacing: -1.8px; fill: ${palette.ink}; }
          .footer { font: 600 17px Arial, Helvetica, sans-serif; letter-spacing: 0.3px; fill: ${palette.soft}; }
        </style>
      </defs>

      <rect width="1200" height="630" fill="${palette.background}"/>
      <circle cx="970" cy="315" r="365" fill="url(#glow)"/>
      ${pixelTiles(seed, tileColours)}
      <rect x="32" y="32" width="1136" height="566" rx="30" fill="url(#panel)" stroke="#FFFFFF" stroke-opacity="0.12"/>

      <g transform="translate(82 67)">
        <rect width="34" height="34" rx="9" fill="${palette.accent}"/>
        <path d="M8 23V11h5l4 6 4-6h5v12h-5v-5l-4 6-4-6v5z" fill="${palette.background}"/>
        <text x="47" y="27" class="brand">Material Mate</text>
      </g>

      <text x="82" y="161" class="category">${escapeXml(category)}</text>
      ${titleSvg}
      <rect x="82" y="488" width="72" height="6" rx="3" fill="${palette.accent}"/>
      <text x="82" y="544" class="footer">Practical guidance for better building and home projects</text>

      <g filter="url(#shadow)" transform="translate(892 209)">
        <path d="M0 154L108 92L216 154L108 216Z" fill="${palette.soft}" opacity="0.96"/>
        <path d="M0 154V202L108 264V216Z" fill="${palette.glow}" opacity="0.88"/>
        <path d="M216 154V202L108 264V216Z" fill="${palette.accent}" opacity="0.88"/>
        <path d="M57 121L108 92L159 121L108 151Z" fill="#FFFFFF" opacity="0.92"/>
        <path d="M57 121V170L108 199V151Z" fill="${palette.glow}"/>
        <path d="M159 121V170L108 199V151Z" fill="${palette.accent}"/>
      </g>

      <circle cx="1120" cy="83" r="7" fill="${palette.accent}"/>
      <circle cx="1094" cy="83" r="7" fill="${palette.glow}"/>
    </svg>
  `

  const data = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()

  return { data, mimeType: 'image/png' }
}

