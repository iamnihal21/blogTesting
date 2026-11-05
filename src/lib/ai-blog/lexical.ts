import type { GeneratedBlog } from './types'

const textNode = (text: string, format = 0) => ({
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

export function articleToLexical(article: GeneratedBlog) {
  const children = article.sections.flatMap((section) => [
    {
      children: [textNode(section.heading)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      tag: 'h2',
      type: 'heading',
      version: 1,
    },
    ...section.paragraphs.map((paragraph) => ({
      children: [textNode(paragraph)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      textStyle: '',
      type: 'paragraph',
      version: 1,
    })),
  ])

  return {
    root: {
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

