'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import { parseService } from '@/lib/ai-blog/serviceCategory'

type Option = { id: string | number; name: string }

export function AIBlogGenerator() {
  const [authors, setAuthors] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/authors?limit=100&depth=0').then((res) => res.json()),
      fetch('/api/categories?limit=100&depth=0').then((res) => res.json()),
    ]).then(([authorData, categoryData]) => {
      setAuthors(authorData.docs || [])
      setCategories((categoryData.docs || []).filter((item: Option & { slug?: string }) => parseService(item.slug) || parseService(item.name)))
    }).catch(() => setError('Could not load authors and categories.'))
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('Generating the article and image. This can take up to two minutes…')
    const data = new FormData(event.currentTarget)
    const body = {
      title: data.get('title'),
      brief: data.get('brief'),
      audience: data.get('audience'),
      tone: data.get('tone'),
      author: data.get('author'),
      category: data.get('category') || undefined,
      keywords: String(data.get('keywords') || '').split(',').map((item) => item.trim()).filter(Boolean),
    }

    try {
      const response = await fetch('/api/posts/ai-generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Generation failed')
      setMessage(`Draft created${result.imageGenerated ? ' with a generated image' : ''}. Opening the editor…`)
      window.location.assign(result.editUrl)
    } catch (caught) {
      setMessage('')
      setError(caught instanceof Error ? caught.message : 'Generation failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, marginBottom: 24, padding: 20 }}>
      <h2 style={{ margin: '0 0 8px' }}>Generate AI blog draft</h2>
      <p style={{ margin: '0 0 20px', color: 'var(--theme-elevation-600)' }}>
        OpenRouter creates a reviewable draft. Give it verified facts; generated posts are never published automatically.
      </p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <label>Title<input name="title" required minLength={5} maxLength={160} style={{ display: 'block', marginTop: 6, width: '100%' }} /></label>
        <label>Factual brief<textarea name="brief" required minLength={30} maxLength={5000} rows={5} placeholder="Service details, locations, verified facts, customer problems, and points the article must cover." style={{ display: 'block', marginTop: 6, width: '100%' }} /></label>
        <label>Target keywords<input name="keywords" placeholder="construction services, furniture assembly, Melbourne" style={{ display: 'block', marginTop: 6, width: '100%' }} /></label>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label>Audience<input name="audience" defaultValue="Australian homeowners and customers seeking trade services" style={{ display: 'block', marginTop: 6, width: '100%' }} /></label>
          <label>Tone<input name="tone" defaultValue="Helpful, credible and professional" style={{ display: 'block', marginTop: 6, width: '100%' }} /></label>
          <label>Author<select name="author" required style={{ display: 'block', marginTop: 6, width: '100%' }}><option value="">Select an author</option>{authors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Service category<select name="category" style={{ display: 'block', marginTop: 6, width: '100%' }}><option value="">Auto-detect from article</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <div><button className="btn btn--style-primary" type="submit" disabled={busy || authors.length === 0}>{busy ? 'Generating…' : 'Generate draft'}</button></div>
        {message && <p role="status" style={{ margin: 0 }}>{message}</p>}
        {error && <p role="alert" style={{ color: 'var(--theme-error-500)', margin: 0 }}>{error}</p>}
      </form>
    </section>
  )
}

