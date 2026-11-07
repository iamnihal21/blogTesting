import { getPayload } from 'payload'
import config from '../src/payload.config'
import { articleToLexical } from '../src/lib/ai-blog/lexical'
import { generateTemplateImage } from '../src/lib/ai-blog/templateImage'
import type { GeneratedBlog } from '../src/lib/ai-blog/types'

// This runs against DATABASE_URI from your environment. Use a test database.
if (process.env.NODE_ENV === 'production') {
  throw new Error('Demo seeding is disabled in production.')
}
if (!process.env.DATABASE_URI) throw new Error('Set DATABASE_URI to your test database first.')

const topics = [
  ['Planning Your First Home Renovation', 'Define the scope and list the rooms you want to improve.'],
  ['Choosing Furniture for a Small Apartment', 'Measure doorways and walkways before choosing furniture.'],
  ['Preparing Your Home for a Painting Project', 'Move furnishings away from walls and discuss surface preparation.'],
  ['Questions to Ask Before Hiring a Builder', 'Ask about relevant experience, communication and written scope.'],
  ['A Simple Guide to Kitchen Storage', 'Group everyday items by how and where you use them.'],
  ['Creating a Comfortable Outdoor Living Space', 'Consider shade, drainage and how the space will be used.'],
  ['Planning a Bathroom Refresh', 'List the fittings you want to retain and those you want to replace.'],
  ['Caring for Timber Furniture', 'Follow the manufacturer’s cleaning and maintenance instructions.'],
  ['Preparing for a Furniture Assembly Service', 'Check the delivery and clear a safe workspace before the appointment.'],
  ['A Home Maintenance Checklist for Busy Households', 'Keep a record of inspections, repairs and upcoming maintenance.'],
]

const payload = await getPayload({ config })
try {
  const authorResult = await payload.find({ collection: 'authors', where: { slug: { equals: 'demo-test-author' } }, limit: 1 })
  const author = authorResult.docs[0] || await payload.create({
    collection: 'authors', data: { name: 'Demo Test Author', slug: 'demo-test-author', bio: 'Fictional author for local testing only.' },
  })
  const categoryResult = await payload.find({ collection: 'categories', where: { slug: { equals: 'demo-testing' } }, limit: 1 })
  const category = categoryResult.docs[0] || await payload.create({
    collection: 'categories', data: { name: 'Demo Testing', slug: 'demo-testing' },
  })

  let created = 0
  for (const [index, [topic, tip]] of topics.entries()) {
    const slug = `demo-test-blog-${String(index + 1).padStart(2, '0')}`
    const existing = await payload.find({ collection: 'posts', draft: true, where: { slug: { equals: slug } }, limit: 1 })
    if (existing.docs.length) {
      console.log(`Skipped existing ${slug}`)
      continue
    }
    const title = `[DEMO] ${topic}`
    const excerpt = `Test content only. ${tip}`
    const article: GeneratedBlog = {
      serviceCategory: 'furniture',
      title, slug, excerpt, metaTitle: title.slice(0, 70), metaDescription: excerpt.slice(0, 160),
      tags: ['demo', 'testing'], imagePrompt: '', imageAlt: `${title} — abstract pixel cover`,
      sections: [
        { heading: 'Demo content — not for publication', paragraphs: ['This is a fictional test article for checking layouts, rich text, media and draft editing. It is not professional advice.'] },
        { heading: 'Getting started', paragraphs: [tip, 'Write down your priorities and collect the information needed to discuss the project with a suitable professional.'] },
        { heading: 'Plan the next step', paragraphs: ['Compare the scope of available options and ask for clarification where details are missing. Keep notes so you can review your decisions.'] },
        { heading: 'Testing checklist', paragraphs: ['Check the featured image, heading spacing, paragraph layout, author, category, tags and SEO fields in the editor. This post is intentionally saved as a draft.'] },
      ],
    }
    const image = await generateTemplateImage({
      title,
      slug,
      category: category.name,
    })
    const media = await payload.create({
      collection: 'media', data: { alt: article.imageAlt },
      file: { data: image.data, mimetype: image.mimeType, name: `${slug}.png`, size: image.data.length },
    })
    try {
      await payload.create({
        collection: 'posts', draft: true,
        data: {
          title, slug, excerpt, content: articleToLexical(article), author: author.id, category: category.id,
          featuredImage: media.id, tags: article.tags.map((tag) => ({ tag })), status: 'draft', _status: 'draft',
          seo: { metaTitle: article.metaTitle, metaDescription: article.metaDescription, ogImage: media.id },
        },
      })
    } catch (error) {
      // Remove only the newly created image if its post could not be saved.
      await payload.delete({ collection: 'media', id: media.id })
      throw error
    }
    created++
    console.log(`Created ${slug}`)
  }
  console.log(`Done: ${created} drafts created; ${topics.length - created} existing demos skipped. No AI calls made.`)
} finally {
  await payload.destroy()
}
