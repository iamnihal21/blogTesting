export const SERVICES = ['furniture', 'roofing', 'plumbing'] as const
export type ServiceCategory = typeof SERVICES[number]
export const SERVICE_NAMES: Record<ServiceCategory, string> = {
  furniture: 'Furniture', roofing: 'Roofing', plumbing: 'Plumbing',
}

export function parseService(value: unknown): ServiceCategory | undefined {
  if (typeof value !== 'string') return undefined
  const name = value.trim().toLowerCase()
  if (name === 'roof') return 'roofing'
  return SERVICES.find((service) => service === name)
}

// Equal-size tile masks preserve the pixel-art language of the original glow.
export const SERVICE_ICONS: Record<ServiceCategory, string[]> = {
  furniture: [
    '00000000000', '00111111100', '00111111100',
    '11111111111', '11000000011', '11111111111',
    '11111111111', '01000000010', '00000000000',
  ],
  roofing: [
    '00000100000', '00001110010', '00011011010',
    '00110001110', '01100000110', '11000000011',
    '00111111100', '00100100100', '00100100100',
  ],
  plumbing: [
    '01100000000', '01100000000', '01111111000',
    '01111111000', '00000011000', '00000010000',
    '00000111000', '00000111000', '00000010000',
  ],
}
