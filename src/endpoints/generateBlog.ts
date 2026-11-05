import type { PayloadHandler } from 'payload'

import { articleToLexical } from '@/lib/ai-blog/lexical'
import { generateArticle, generateImage } from '@/lib/ai-blog/openrouter'
import type { GenerateBlogInput } from '@/lib/ai-blog/types'

function extensionFor(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/gif') return 'gif'
  return 'png'
}

function parseInput(value: unknown): GenerateBlogInput {
  if (!value || typeof value !== 'object') throw new Error('Request body is required')
  const body = value as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const brief = typeof body.brief === 'string' ? body.brief.trim() : ''
  const author = Number(body.author)
  const category = body.category === undefined || body.category === '' ? undefined : Number(body.category)
  if (title.length < 5 || title.length > 160) throw new Error('Title must be between 5 and 160 characters')
  if (brief.length < 30 || brief.length > 5000) throw new Error('Factual brief must be between 30 and 5,000 characters')
  if (!Number.isSafeInteger(author) || author <= 0) throw new Error('Author is required')
  if (category !== undefined && (!Number.isSafeInteger(category) || category <= 0)) {
    throw new Error('Category is invalid')
  }

  return {
    title,
    brief,
    author,
    category,
    audience: typeof body.audience === 'string' ? body.audience.trim().slice(0, 500) : undefined,
    tone: typeof body.tone === 'string' ? body.tone.trim().slice(0, 200) : undefined,
    keywords: Array.isArray(body.keywords)
      ? body.keywords.filter((item): item is string => typeof item === 'string').slice(0, 12)
      : [],
  }
}

export const generateBlog: PayloadHandler = async (req) => {
  const { user } = await req.payload.auth({ headers: req.headers })
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  try {
    const input = parseInput(await req.json?.())
    const article = await generateArticle(input)
    const generatedImage = await generateImage(article.imagePrompt)

    let featuredImage: number | undefined
    if (generatedImage) {
      const media = await req.payload.create({
        collection: 'media',
        data: { alt: article.imageAlt },
        file: {
          data: generatedImage.data,
          mimetype: generatedImage.mimeType,
          name: `${article.slug}.${extensionFor(generatedImage.mimeType)}`,
          size: generatedImage.data.byteLength,
        },
        req,
      })
      featuredImage = media.id
    }

    const post = await req.payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: articleToLexical(article),
        author: input.author,
        category: input.category,
        featuredImage,
        tags: article.tags.map((tag) => ({ tag })),
        status: 'draft',
        seo: {
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          ogImage: featuredImage,
        },
      },
      req,
    })

    return Response.json({
      id: post.id,
      title: post.title,
      imageGenerated: Boolean(featuredImage),
      editUrl: `/admin/collections/posts/${post.id}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not generate the blog draft'
    req.payload.logger.error({ err: error }, 'AI blog generation failed')
    return Response.json({ error: message }, { status: 400 })
  }
}

