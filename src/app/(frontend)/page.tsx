import React from 'react'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { formatDate } from '@/lib/formatDate'

export const dynamic = 'force-dynamic'

export default async function BlogListingPage() {
  const payload = await getPayloadClient()

  const now = new Date().toISOString()
  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          or: [
            { _status: { equals: 'published' } },
            { status: { equals: 'published' } },
          ],
        },
        {
          or: [
            { publishedAt: { less_than_equal: now } },
            { publishedAt: { exists: false } },
            { publishedAt: { equals: null } },
          ],
        },
      ],
    },
    sort: '-createdAt',
    limit: 20,
    depth: 2,
  })

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          SpeedAI Labs Blog
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.125rem' }}>
          Insights, tutorials, and updates from our team
        </p>
      </header>

      {/* Posts Grid */}
      {posts.docs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '4rem 0' }}>
          No posts published yet. Head to{' '}
          <Link href="/admin" style={{ color: 'var(--primary)' }}>/admin</Link>{' '}
          to create your first post.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem',
        }}>
          {posts.docs.map((post: any) => {
            const featuredImage = post.featuredImage as any
            const author = post.author as any
            const category = post.category as any

            return (
              <article
                key={post.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  background: 'var(--card-bg)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {featuredImage?.url && (
                  <Link href={`/blog/${post.slug}`}>
                    <img
                      src={featuredImage.sizes?.feature?.url || featuredImage.url}
                      alt={featuredImage.alt || post.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </Link>
                )}
                <div style={{ padding: '1.25rem' }}>
                  {category && (
                    <span style={{
                      display: 'inline-block',
                      background: 'var(--tag-bg)',
                      color: 'var(--tag-text)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {category.name}
                    </span>
                  )}
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p style={{
                    color: 'var(--muted)',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.excerpt}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--muted)',
                  }}>
                    <span>{author?.name || 'Team'}</span>
                    <time dateTime={post.publishedAt || post.createdAt}>
                      {formatDate(post.publishedAt || post.createdAt)}
                    </time>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

