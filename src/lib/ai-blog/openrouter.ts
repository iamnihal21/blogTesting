import type { GeneratedBlog, GenerateBlogInput } from './types'
import { SERVICES } from './serviceCategory'
import { generateGeminiImage, hasGeminiImageConfig } from './gemini'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_IMAGES_URL = 'https://openrouter.ai/api/v1/images'
const MAX_IMAGE_BYTES = 12 * 1024 * 1024

type OpenRouterMessage = {
  content?: string | Array<{ type?: string; text?: string }>
  images?: Array<{
    image_url?: { url?: string }
    type?: string
  }>
}

type OpenRouterResponse = {
  choices?: Array<{ message?: OpenRouterMessage }>
  error?: { message?: string }
}

type OpenRouterImageResponse = {
  data?: Array<{ b64_json?: string; url?: string }>
  images?: Array<{ b64_json?: string; url?: string; image_url?: { url?: string } }>
  error?: { message?: string }
}

const articleSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'serviceCategory',
    'title',
    'slug',
    'excerpt',
    'metaTitle',
    'metaDescription',
    'tags',
    'sections',
    'imagePrompt',
    'imageAlt',
  ],
  properties: {
    serviceCategory: { type: 'string', enum: SERVICES },
    title: { type: 'string' },
    slug: { type: 'string' },
    excerpt: { type: 'string' },
    metaTitle: { type: 'string' },
    metaDescription: { type: 'string' },
    tags: { type: 'array', minItems: 3, maxItems: 8, items: { type: 'string' } },
    sections: {
      type: 'array',
      minItems: 4,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['heading', 'paragraphs'],
        properties: {
          heading: { type: 'string' },
          paragraphs: {
            type: 'array',
            minItems: 1,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
      },
    },
    imagePrompt: { type: 'string' },
    imageAlt: { type: 'string' },
  },
} as const

function config() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured')

  return {
    apiKey,
    textModel: process.env.OPENROUTER_TEXT_MODEL || 'openai/gpt-4.1-mini',
    imageModel: process.env.OPENROUTER_IMAGE_MODEL,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  }
}

async function callOpenRouter(body: Record<string, unknown>): Promise<OpenRouterResponse> {
  const { apiKey, siteUrl } = config()
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': 'Material Mate Blog Generator',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  })

  const payload = (await response.json().catch(() => ({}))) as OpenRouterResponse
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenRouter request failed (${response.status})`)
  }
  return payload
}

async function callOpenRouterImage(body: Record<string, unknown>): Promise<OpenRouterImageResponse> {
  const { apiKey, siteUrl } = config()
  const response = await fetch(OPENROUTER_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': 'Material Mate Blog Generator',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  })

  const payload = (await response.json().catch(() => ({}))) as OpenRouterImageResponse
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenRouter image request failed (${response.status})`)
  }
  return payload
}

function messageText(message?: OpenRouterMessage): string {
  if (typeof message?.content === 'string') return message.content
  if (Array.isArray(message?.content)) {
    return message.content.map((part) => part.text || '').join('')
  }
  return ''
}

function cleanSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
}

function assertGeneratedBlog(value: unknown): GeneratedBlog {
  if (!value || typeof value !== 'object') throw new Error('The model returned an invalid article')
  const article = value as Partial<GeneratedBlog>
  if (!SERVICES.includes(article.serviceCategory as typeof SERVICES[number])) {
    throw new Error('The model must classify the article as furniture, roofing or plumbing')
  }
  const strings: Array<keyof GeneratedBlog> = [
    'title', 'slug', 'excerpt', 'metaTitle', 'metaDescription', 'imagePrompt', 'imageAlt',
  ]
  if (strings.some((key) => typeof article[key] !== 'string' || !String(article[key]).trim())) {
    throw new Error('The model omitted a required article field')
  }
  if (!Array.isArray(article.tags) || article.tags.some((tag) => typeof tag !== 'string')) {
    throw new Error('The model returned invalid tags')
  }
  if (!Array.isArray(article.sections) || article.sections.length < 1 || article.sections.some(
    (section) => !section || typeof section.heading !== 'string' ||
      !Array.isArray(section.paragraphs) || section.paragraphs.some((p) => typeof p !== 'string'),
  )) {
    throw new Error('The model returned invalid article sections')
  }

  return {
    ...article,
    title: article.title!.trim(),
    slug: cleanSlug(article.slug || article.title!),
    excerpt: article.excerpt!.trim().slice(0, 300),
    metaTitle: article.metaTitle!.trim().slice(0, 70),
    metaDescription: article.metaDescription!.trim().slice(0, 160),
    tags: article.tags.slice(0, 8).map((tag) => tag.trim()).filter(Boolean),
    sections: article.sections,
    imagePrompt: article.imagePrompt!.trim(),
    imageAlt: article.imageAlt!.trim(),
  } as GeneratedBlog
}

export async function generateArticle(input: GenerateBlogInput): Promise<GeneratedBlog> {
  const { textModel } = config()
  const response = await callOpenRouter({
    model: textModel,
    temperature: 0.55,
    max_tokens: 6000,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'material_mate_blog_article',
        strict: true,
        schema: articleSchema,
      },
    },
    messages: [
      {
        role: 'system',
        content: [
          'You are the senior Australian editor for Material Mate, a marketplace for construction, furniture and trade services.',
          'Classify the complete article into exactly one serviceCategory: furniture, roofing, or plumbing. Choose the primary service discussed; for mixed topics choose the dominant service based on the brief and article, not an arbitrary keyword.',
          'Write genuinely useful, specific content in Australian English. Use the supplied brief as the factual source of truth.',
          'Do not invent prices, statistics, regulations, certifications, customer stories or service availability.',
          'Optimise naturally for search intent without keyword stuffing. Write clear headings and practical paragraphs.',
          'The image prompt must describe one premium, photorealistic editorial image in a real Australian setting, 16:9 landscape, natural light, no text, no logos and no watermark.',
          'Return only JSON matching the requested schema.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({
          requestedTitle: input.title,
          factualBrief: input.brief,
          audience: input.audience || 'Australian homeowners and customers seeking trusted trade services',
          targetKeywords: input.keywords || [],
          tone: input.tone || 'helpful, credible and professional',
        }),
      },
    ],
  })

  const content = messageText(response.choices?.[0]?.message)
  if (!content) throw new Error('OpenRouter returned an empty article')
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('OpenRouter did not return valid JSON')
  }
  return assertGeneratedBlog(parsed)
}

function decodeDataUrl(url: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/.exec(url)
  if (!match) return null
  return { mimeType: match[1], data: Buffer.from(match[2], 'base64') }
}

export async function generateImage(prompt: string) {
  if (hasGeminiImageConfig()) return generateGeminiImage(prompt)

  const { imageModel } = config()
  if (!imageModel) return null

  const response = await callOpenRouterImage({
    model: imageModel,
    prompt,
    size: '2048x1152',
  })

  const dataImage = response.data?.[0]
  const imagesImage = response.images?.[0]
  const base64 = dataImage?.b64_json || imagesImage?.b64_json
  if (base64) {
    const data = Buffer.from(base64, 'base64')
    if (data.byteLength > MAX_IMAGE_BYTES) throw new Error('Generated image is larger than 12 MB')
    return { mimeType: 'image/png', data }
  }

  const imageUrl = dataImage?.url || imagesImage?.url || imagesImage?.image_url?.url
  if (!imageUrl) throw new Error('The configured OpenRouter image model returned no image')

  const inline = decodeDataUrl(imageUrl)
  if (inline) {
    if (inline.data.byteLength > MAX_IMAGE_BYTES) throw new Error('Generated image is larger than 12 MB')
    return inline
  }

  const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(60_000) })
  if (!imageResponse.ok) throw new Error('Could not download the generated image')
  const mimeType = imageResponse.headers.get('content-type')?.split(';')[0] || ''
  if (!mimeType.startsWith('image/')) throw new Error('OpenRouter returned a non-image file')
  const data = Buffer.from(await imageResponse.arrayBuffer())
  if (data.byteLength > MAX_IMAGE_BYTES) throw new Error('Generated image is larger than 12 MB')
  return { mimeType, data }
}

