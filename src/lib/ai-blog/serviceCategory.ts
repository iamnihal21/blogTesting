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

export type ServiceScene = {
  name: string
  keywords: string[]
  // 0 = transparent, 1 = main colour, 2 = highlight, 3 = shadow, 4 = detail.
  pixels: string[]
}

// Four hand-drawn, equal-size pixel scenes per service. Keeping every scene on
// the same 11 × 12 grid makes selection predictable and preserves clear title
// space on the right side of the cover.
export const SERVICE_SCENES: Record<ServiceCategory, ServiceScene[]> = {
  furniture: [
    {
      name: 'sofa',
      keywords: ['sofa', 'couch', 'lounge', 'living room', 'upholstery'],
      pixels: [
        '00000000000', '00000000000', '00111111100', '01222222210',
        '11111111111', '11333333311', '11111111111', '11000000011',
        '11000000011', '01000000010', '00000000000', '00000000000',
      ],
    },
    {
      name: 'storage',
      keywords: ['storage', 'cabinet', 'wardrobe', 'shelf', 'shelving', 'cupboard'],
      pixels: [
        '00011111000', '00012221000', '00013331000', '00012221000',
        '00013331000', '00012221000', '00013331000', '00011111000',
        '01100000110', '01220002210', '01110001110', '00000000000',
      ],
    },
    {
      name: 'dining',
      keywords: ['table', 'dining', 'desk', 'workspace', 'office'],
      pixels: [
        '00000200000', '00002220000', '00000200000', '00000000000',
        '00111111100', '00133333100', '00010001000', '01110001110',
        '01010001010', '01010001010', '01000000010', '00000000000',
      ],
    },
    {
      name: 'armchair',
      keywords: ['chair', 'armchair', 'seat', 'reading', 'bedroom', 'assembly'],
      pixels: [
        '00011111000', '00122222100', '00122222100', '00133333100',
        '01111111110', '11222222211', '11333333311', '11111111111',
        '01111111110', '00100000100', '00100000100', '00000000000',
      ],
    },
  ],
  roofing: [
    {
      name: 'house-roof',
      keywords: ['house', 'home', 'roofline', 'new roof', 'replacement'],
      pixels: [
        '00000100000', '00001110000', '00011111000', '00111111100',
        '01122222210', '11000000011', '00100000100', '00103330100',
        '00103330100', '00111111100', '00000000000', '00000000000',
      ],
    },
    {
      name: 'roof-tiles',
      keywords: ['tile', 'tiles', 'terracotta', 'metal roof', 'material'],
      pixels: [
        '00000000010', '00000000110', '00000001120', '00000011220',
        '00000112210', '00001122110', '00011221120', '00112211220',
        '01122112210', '11221122110', '33333333333', '00000000000',
      ],
    },
    {
      name: 'roof-ladder',
      keywords: ['inspection', 'inspect', 'repair', 'maintenance', 'tradie', 'builder'],
      pixels: [
        '00000000000', '00001000000', '00011100000', '00111110000',
        '01122211404', '11222221444', '33333333404', '00000000444',
        '00000000404', '00000000444', '00000000404', '00000000000',
      ],
    },
    {
      name: 'rain-gutter',
      keywords: ['rain', 'storm', 'leak', 'gutter', 'drainage', 'wet season'],
      pixels: [
        '00222002220', '02222222220', '00222222200', '00040040000',
        '00400400400', '04004004000', '00000100000', '00001110000',
        '00011111000', '00111111100', '33333333334', '00000000044',
      ],
    },
  ],
  plumbing: [
    {
      name: 'tap-drop',
      keywords: ['tap', 'faucet', 'leak', 'drip', 'water', 'washer'],
      pixels: [
        '00111000000', '00111000000', '11111110000', '11111110000',
        '00000110000', '00000100000', '00004000000', '00044400000',
        '00444440000', '00044400000', '00004000000', '00000000000',
      ],
    },
    {
      name: 'pipe-route',
      keywords: ['pipe', 'pipes', 'blocked', 'drain', 'sewer', 'connection'],
      pixels: [
        '11000000000', '11000000000', '11111111100', '13333333100',
        '00000001100', '00000001100', '00111111100', '00133333300',
        '00110000000', '00110000000', '00111111110', '00000000000',
      ],
    },
    {
      name: 'basin',
      keywords: ['sink', 'basin', 'kitchen', 'bathroom', 'vanity', 'renovation'],
      pixels: [
        '00001100000', '00011110000', '00010010000', '00111110000',
        '00133330000', '00000000000', '01111111110', '01222222210',
        '00133333100', '00011111000', '00001110000', '00000000000',
      ],
    },
    {
      name: 'shower',
      keywords: ['shower', 'hot water', 'heater', 'pressure', 'temperature'],
      pixels: [
        '00111110000', '01333311000', '01000011000', '00000011000',
        '00000111000', '00001110000', '00040404000', '00404040000',
        '04040404000', '00404040000', '00000000000', '00000000000',
      ],
    },
  ],
}

function stableIndex(value: string, length: number) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return (result >>> 0) % length
}

export function selectServiceScene(
  service: ServiceCategory,
  title: string,
  slug = title,
): ServiceScene {
  const scenes = SERVICE_SCENES[service]
  const searchable = title.toLowerCase()
  const ranked = scenes
    .map((scene, index) => ({
      scene,
      index,
      score: scene.keywords.reduce(
        (score, keyword) => score + (searchable.includes(keyword) ? keyword.length : 0),
        0,
      ),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)

  if (ranked[0].score > 0) return ranked[0].scene
  return scenes[stableIndex(`${service}:${slug}`, scenes.length)]
}
