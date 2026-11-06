import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

import {
  SERVICES,
  SERVICE_SCENES,
  selectServiceScene,
} from '../src/lib/ai-blog/serviceCategory'
import { generateTemplateImage } from '../src/lib/ai-blog/templateImage'

const hashes = new Set<string>()

for (const service of SERVICES) {
  const scenes = SERVICE_SCENES[service]
  assert.equal(scenes.length, 4, `${service} must have four cover scenes`)
  assert.equal(new Set(scenes.map((scene) => scene.name)).size, scenes.length)

  for (const scene of scenes) {
    assert.equal(scene.pixels.length, 12, `${service}/${scene.name} must be 12 rows high`)
    assert.ok(
      scene.pixels.every((row) => row.length === 11 && !/[^0-4]/.test(row)),
      `${service}/${scene.name} must use an 11-column 0–4 mask`,
    )

    const title = `A practical ${scene.keywords[0]} guide`
    assert.equal(selectServiceScene(service, title).name, scene.name)
    const image = await generateTemplateImage({
      title,
      slug: `${service}-${scene.name}`,
      category: service,
      serviceCategory: service,
    })
    const metadata = await sharp(image.data).metadata()
    assert.equal(metadata.format, 'png')
    assert.equal(metadata.width, 1200)
    assert.equal(metadata.height, 630)
    hashes.add(createHash('sha256').update(image.data).digest('hex'))
  }
}

assert.equal(hashes.size, 12, 'Every category scene should render a distinct cover')
console.log('Passed: 12 distinct keyword-selected category scenes rendered at 1200×630.')
