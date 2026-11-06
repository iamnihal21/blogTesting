import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { createVectorCoverSVG, type VectorImageInput } from '../src/lib/ai-blog/vectorImage'

// Uses the same generator as Payload. No database, secrets or AI requests.
const output = path.resolve(process.argv[2] || 'generated-covers')
await mkdir(output, { recursive: true })
const examples: VectorImageInput[] = [
  { serviceCategory: 'furniture', slug: 'sofa-guide', title: 'Choosing the Right Sofa for a Small Living Room' },
  { serviceCategory: 'furniture', slug: 'storage-guide', title: 'Custom Storage for Small Homes' },
  { serviceCategory: 'furniture', slug: 'dining-guide', title: 'Choosing a Dining Table' },
  { serviceCategory: 'roofing', slug: 'roof-guide', title: 'Replacing Your Roof' },
  { serviceCategory: 'roofing', slug: 'inspection-guide', title: 'Professional Roof Inspection' },
  { serviceCategory: 'roofing', slug: 'rain-guide', title: 'Gutter Care Before Heavy Rain' },
  { serviceCategory: 'plumbing', slug: 'basin-guide', title: 'Planning a Bathroom Basin Renovation' },
  { serviceCategory: 'plumbing', slug: 'pipes-guide', title: 'Planning New Pipes' },
  { serviceCategory: 'plumbing', slug: 'shower-guide', title: 'Improving Shower Pressure' },
]
const thumbnails = []
for (const input of examples) {
  const svg = createVectorCoverSVG(input)
  const filename = `${input.serviceCategory}-${input.slug}`
  await writeFile(path.join(output, `${filename}.svg`), svg)
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  await writeFile(path.join(output, `${filename}.png`), png)
  thumbnails.push(await sharp(png).resize(480, 252).png().toBuffer())
  console.log(`Exported ${filename}.svg and .png`)
}
await sharp({ create: { width: 1440, height: 756, channels: 3, background: '#fff' } })
  .composite(thumbnails.map((input, index) => ({ input, left: (index % 3) * 480, top: Math.floor(index / 3) * 252 })))
  .png().toFile(path.join(output, 'preview.png'))
console.log(`Saved nine SVG/PNG pairs and preview.png in ${output}`)
