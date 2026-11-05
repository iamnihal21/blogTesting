import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '4rem 1rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
        Post Not Found
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        style={{
          color: 'var(--primary)',
          textDecoration: 'underline',
        }}
      >
        ← Back to all posts
      </Link>
    </main>
  )
}

