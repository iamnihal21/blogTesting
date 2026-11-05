import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const payload = await getPayloadClient()

  const posts = await payload.find({
    collection: 'posts',
    where: {
      or: [
        { _status: { equals: 'published' } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 10000,
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const postEntries: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postEntries,
  ]
}

