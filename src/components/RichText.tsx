import React from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

type Props = {
  data: SerializedEditorState | null | undefined
  className?: string
}

export function RichText({ data, className }: Props) {
  if (!data) return null

  return (
    <div className={className}>
      <PayloadRichText data={data} />
    </div>
  )
}

