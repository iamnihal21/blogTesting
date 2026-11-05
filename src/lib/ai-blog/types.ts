export type GenerateBlogInput = {
  title: string
  brief: string
  audience?: string
  keywords?: string[]
  tone?: string
  author: number
  category?: number
}

export type GeneratedBlog = {
  title: string
  slug: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  tags: string[]
  sections: Array<{
    heading: string
    paragraphs: string[]
  }>
  imagePrompt: string
  imageAlt: string
}

