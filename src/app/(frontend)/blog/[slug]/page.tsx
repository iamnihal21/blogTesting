import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { formatDate } from '@/lib/formatDate'
import { RichText } from '@/components/RichText'

type Args = {
  params: Promise<{ slug: string }>
}

// Generate static params for all published posts (SSG + ISR)
export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const posts = await payload.find({
    collection: 'posts',
    where: {
      or: [
        { _status: { equals: 'published' } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 1000,
    select: { slug: true },
  })
  return posts.docs.map((post) => ({ slug: post.slug }))
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  const post = docs[0]
  if (!post) return { title: 'Post Not Found' }

  const featuredImage = post.featuredImage as any
  const ogImage = (post.seo?.ogImage as any)?.url || featuredImage?.sizes?.feature?.url || featuredImage?.url

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      url: `${siteUrl}/blog/${post.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: post.seo?.canonicalUrl || `${siteUrl}/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
        {
          or: [
            { _status: { equals: 'published' } },
            { status: { equals: 'published' } },
          ],
        },
      ],
    },
    depth: 2,
    limit: 1,
  })

  const post = docs[0]
  if (!post) notFound()

  const featuredImage = post.featuredImage as any
  const author = post.author as any
  const category = post.category as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // JSON-LD Structured Data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: featuredImage?.sizes?.feature?.url || featuredImage?.url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: author?.name || 'SpeedAI Labs Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SpeedAI Labs',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--muted)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '2rem',
          }}
        >
          ← Back to all posts
        </Link>

        <article>
          {/* Category */}
          {category && (
            <span style={{
              display: 'inline-block',
              background: 'var(--tag-bg)',
              color: 'var(--tag-text)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {category.name}
            </span>
          )}

          {/* Title */}
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            {post.title}
          </h1>

          {/* Meta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--muted)',
            fontSize: '0.9rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            {author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {author.avatar?.url && (
                  <img
                    src={author.avatar.sizes?.thumbnail?.url || author.avatar.url}
                    alt={author.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{author.name}</span>
              </div>
            )}
            <time dateTime={post.publishedAt || post.createdAt}>
              {formatDate(post.publishedAt || post.createdAt)}
            </time>
          </div>

          {/* Featured Image */}
          {featuredImage?.url && (
            <img
              src={featuredImage.sizes?.feature?.url || featuredImage.url}
              alt={featuredImage.alt || post.title}
              style={{
                width: '100%',
                borderRadius: '0.75rem',
                marginBottom: '2rem',
                maxHeight: '500px',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Content */}
          <div className="prose">
            <RichText data={post.content} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginTop: '3rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
            }}>
              {post.tags.map((item: any, idx: number) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--tag-bg)',
                    color: 'var(--tag-text)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  #{item.tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>
    </>
  )
}

