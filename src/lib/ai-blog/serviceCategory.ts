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
