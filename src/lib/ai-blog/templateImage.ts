import sharp from 'sharp'

type TemplateImageInput = { title: string; slug: string; category?: string }

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function wrapTitle(title: string, maximumCharacters = 19, maximumLines = 4) {
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
    if (finalLine.length > maximumCharacters + 5) finalLine = `${finalLine.slice(0, maximumCharacters + 2).trimEnd()}…`
    lines.push(finalLine)
  }
  return lines.slice(0, maximumLines)
}

function backgroundTiles(seed: number) {
  const colours = ['#403775', '#574C8C', '#7066A0', '#8B83B5', '#ABA6CA', '#D5D5E8']
  const tiles: string[] = []
  for (let row = 0; row < 14; row += 1) {
    for (let column = 0; column < 25; column += 1) {
      const value = hash(`${seed}-${row}-${column}`)
      const colourIndex = Math.min(colours.length - 1, Math.max(0, Math.floor(column / 5) + (value % 3) - 1))
      const opacity = 0.12 + (value % 5) * 0.035
      tiles.push(`<rect x="${column * 48}" y="${row * 48}" width="49" height="49" fill="${colours[colourIndex]}" opacity="${opacity.toFixed(2)}"/>`)
    }
  }
  return tiles.join('')
}

function pixelGlow(seed: number) {
  const tiles: string[] = []
  const centreColumn = 6 + (seed % 2)
  const centreRow = 6
  const glowColours = ['#8A7544', '#AE8C39', '#D2A82E', '#F0BE22', '#FFD13A']
  for (let row = 1; row < 13; row += 1) {
    for (let column = 1; column < 13; column += 1) {
      const distance = Math.hypot(column - centreColumn, row - centreRow)
      if (distance > 5.5) continue
      const intensity = Math.max(0, 4 - Math.floor(distance))
      const value = hash(`glow-${seed}-${row}-${column}`)
      const opacity = Math.min(0.94, 0.42 + intensity * 0.11 + (value % 3) * 0.025)
      tiles.push(`<rect x="${column * 48}" y="${row * 48}" width="49" height="49" fill="${glowColours[intensity]}" opacity="${opacity.toFixed(2)}"/>`)
    }
  }
  return tiles.join('')
}

export async function generateTemplateImage(input: TemplateImageInput) {
  const seed = hash(`${input.slug}:${input.category || ''}`)
  const lines = wrapTitle(input.title)
  const fontSize = lines.length <= 2 ? 66 : lines.length === 3 ? 57 : 50
  const lineHeight = Math.round(fontSize * 1.08)
  const titleStartY = 250 - ((lines.length - 1) * lineHeight) / 2
  const category = (input.category || 'Material Mate Guide').toUpperCase()
  const titleSvg = lines.map((line, index) => `<text x="665" y="${titleStartY + index * lineHeight}" class="title">${escapeXml(line)}</text>`).join('')

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="background"><stop stop-color="#403775"/><stop offset="52%" stop-color="#746BA5"/><stop offset="100%" stop-color="#D8D8EB"/></linearGradient>
        <linearGradient id="readingPanel"><stop stop-color="#EEEFFA" stop-opacity="0.18"/><stop offset="25%" stop-color="#F4F4FA" stop-opacity="0.74"/><stop offset="100%" stop-color="#F7F7FB" stop-opacity="0.93"/></linearGradient>
        <style>
          .category { font: 700 16px Arial, Helvetica, sans-serif; letter-spacing: 3px; fill: #554B7D; }
          .title { font: 700 ${fontSize}px Arial, Helvetica, sans-serif; letter-spacing: -1.5px; fill: #24213B; }
          .brand { font: 700 24px Arial, Helvetica, sans-serif; letter-spacing: -0.6px; fill: #40375F; }
        </style>
      </defs>
      <rect width="1200" height="630" fill="url(#background)"/>
      ${backgroundTiles(seed)}
      ${pixelGlow(seed)}
      <rect x="600" width="600" height="630" fill="url(#readingPanel)"/>
      <text x="665" y="104" class="category">${escapeXml(category)}</text>
      ${titleSvg}
      <rect x="665" y="491" width="68" height="6" fill="#E9B522"/>
      <text x="665" y="550" class="brand">Material Mate</text>
      <rect x="742" width="48" height="48" fill="#E2E3F0" opacity="0.82"/>
      <rect x="1056" y="144" width="48" height="48" fill="#5D538F" opacity="0.7"/>
      <rect x="1008" y="336" width="48" height="48" fill="#FFFFFF" opacity="0.52"/>
    </svg>`

  const data = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer()
  return { data, mimeType: 'image/png' }
}
