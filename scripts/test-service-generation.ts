import assert from 'node:assert/strict'
import type { PayloadRequest } from 'payload'
import { generateBlog } from '../src/endpoints/generateBlog'
import { SERVICES } from '../src/lib/ai-blog/serviceCategory'

// Isolated contract tests: no real database, secrets or provider requests.
const previousFetch = globalThis.fetch
const oldKey = process.env.OPENROUTER_API_KEY
const oldMode = process.env.BLOG_IMAGE_MODE
process.env.OPENROUTER_API_KEY = 'test-only'
process.env.BLOG_IMAGE_MODE = 'template'
let modelCategory: string = 'furniture'
let calls = 0
globalThis.fetch = async (_url, options) => {
  calls++
  const request = JSON.parse(String(options?.body))
  assert.deepEqual(request.response_format.json_schema.schema.properties.serviceCategory.enum, SERVICES)
  return Response.json({ choices: [{ message: { content: JSON.stringify({
    serviceCategory: modelCategory, title: 'A service guide', slug: 'a-service-guide',
    excerpt: 'A useful service guide.', metaTitle: 'Service guide', metaDescription: 'Plan your project.',
    tags: ['guide'], sections: [{ heading: 'Planning', paragraphs: ['Talk to a qualified professional.'] }],
    imagePrompt: 'A home project', imageAlt: 'Home project',
  }) } }] })
}

async function run(category?: { id: number; name: string; slug: string }, authenticated = true) {
  const writes: Array<{ collection: string; data: Record<string, unknown>; draft?: boolean }> = []
  const req = {
    headers: new Headers(),
    json: async () => ({ title: 'A service guide', brief: 'A factual brief explaining how to plan a home service project.', author: 1, category: category?.id }),
    payload: {
      auth: async () => ({ user: authenticated ? { id: 1 } : null }),
      findByID: async () => category,
      find: async () => ({ docs: [] }),
      create: async (args: typeof writes[number]) => { writes.push(args); return { ...args.data, id: writes.length + 10 } },
      logger: { error: () => {} },
    },
  } as unknown as PayloadRequest
  const response = await generateBlog(req)
  assert.ok(response instanceof Response)
  return { response, writes }
}

try {
  for (const service of SERVICES) {
    modelCategory = service
    const { response, writes } = await run()
    assert.equal(response.status, 200)
    assert.equal(writes[0].collection, 'categories')
    assert.equal(writes[0].data.slug, service)
    assert.equal(writes[1].collection, 'media')
    assert.equal(writes[2].data.category, 11)
    assert.equal(writes[2].data.featuredImage, 12)
    assert.equal(writes[2].data.status, 'draft')
    assert.equal(writes[2].draft, true)
  }
  modelCategory = 'plumbing'
  const override = await run({ id: 42, name: 'Furniture', slug: 'furniture' })
  assert.equal(override.response.status, 200)
  assert.equal(override.writes.at(-1)?.data.category, 42)
  assert.match(String(override.writes[0].data.alt), /Furniture/)
  modelCategory = 'gardening'
  const invalidModel = await run()
  assert.equal(invalidModel.response.status, 400)
  assert.equal(invalidModel.writes.length, 0)
  const before = calls
  assert.equal((await run({ id: 43, name: 'Gardening', slug: 'gardening' })).response.status, 400)
  assert.equal((await run(undefined, false)).response.status, 401)
  assert.equal(calls, before)
  console.log('Passed: three automatic categories, manual override, invalid category, invalid model output and unauthenticated request.')
} finally {
  globalThis.fetch = previousFetch
  if (oldKey === undefined) delete process.env.OPENROUTER_API_KEY
  else process.env.OPENROUTER_API_KEY = oldKey
  if (oldMode === undefined) delete process.env.BLOG_IMAGE_MODE
  else process.env.BLOG_IMAGE_MODE = oldMode
}
