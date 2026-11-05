const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MAX_IMAGE_BYTES = 12 * 1024 * 1024

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { data?: string; mimeType?: string }
        inline_data?: { data?: string; mime_type?: string }
        text?: string
      }>
    }
  }>
  error?: { message?: string }
  promptFeedback?: { blockReason?: string }
}

export function hasGeminiImageConfig() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
}

export async function generateGeminiImage(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  const response = await fetch(`${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    }),
    signal: AbortSignal.timeout(120_000),
  })

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini image request failed (${response.status})`)
  }

  const parts = payload.candidates?.[0]?.content?.parts || []
  for (const part of parts) {
    const inline = part.inlineData || (part.inline_data
      ? { data: part.inline_data.data, mimeType: part.inline_data.mime_type }
      : undefined)
    if (!inline?.data) continue

    const mimeType = inline.mimeType || 'image/png'
    if (!mimeType.startsWith('image/')) continue
    const data = Buffer.from(inline.data, 'base64')
    if (data.byteLength > MAX_IMAGE_BYTES) throw new Error('Generated image is larger than 12 MB')
    return { mimeType, data }
  }

  const blocked = payload.promptFeedback?.blockReason
  if (blocked) throw new Error(`Gemini blocked the image prompt: ${blocked}`)
  throw new Error('Gemini returned no image. Confirm that GEMINI_IMAGE_MODEL supports image output.')
}

