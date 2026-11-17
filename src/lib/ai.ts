import type { FurnitureRow } from './types'
import { getTheme, STYLES, type RoomTypeToken } from './design'

export type AiPaletteColor = { name: string; hex: string; note: string }

export type AiPlan = {
  headline: string
  summary: string
  themeId: string
  themeName: string
  palette: AiPaletteColor[]
  picks: (FurnitureRow & { role: string })[]
  total: number
  budget: number
  tips: string[]
}

const ROOM_CATEGORIES: Record<string, string[]> = {
  living: ['rug', 'sofa', 'chair', 'table', 'lamp', 'plant', 'decor'],
  bedroom: ['rug', 'bed', 'wardrobe', 'lamp', 'chair', 'plant'],
  kitchen: ['kitchen', 'chair', 'lamp', 'plant', 'decor'],
  dining: ['rug', 'table', 'chair', 'lamp', 'plant', 'wardrobe'],
  study: ['rug', 'desk', 'chair', 'lamp', 'wardrobe', 'plant'],
  nursery: ['rug', 'bed', 'wardrobe', 'chair', 'lamp', 'plant'],
  studio: ['rug', 'desk', 'chair', 'lamp', 'plant', 'decor'],
}

const ROLE_LABEL: Record<string, string> = {
  rug: 'To ground the room',
  sofa: 'The anchor piece',
  chair: 'A second seat',
  table: 'Surface & centre',
  lamp: 'Warm light',
  plant: 'Something living',
  decor: 'Quiet detail',
  bed: 'The centre of gravity',
  wardrobe: 'Storage that disappears',
  kitchen: 'The working spine',
  desk: 'A place to think',
}

const STYLE_TO_THEME: Record<string, string> = {
  scandinavian: 'cream',
  japandi: 'sage',
  'mid-century': 'peach',
  boho: 'peach',
  modern: 'blush',
  vintage: 'sage',
  minimalist: 'cream',
  eclectic: 'lavender',
}

const MOOD_THEMES: Record<string, string[]> = {
  soft: ['blush', 'lavender', 'cream'],
  warm: ['peach', 'cream', 'blush'],
  fresh: ['mint', 'sage', 'cream'],
  calm: ['lavender', 'mint', 'sage'],
}

const EXTRA_NOTES = [
  'Carries the light from the window across the room.',
  'A little depth so the pastels do not float away.',
  'Keeps the scheme from feeling too sweet.',
  'The bridging tone between wood and wall.',
  'Anchors the busiest corner.',
]

function pickForCategory(
  catalog: FurnitureRow[],
  category: string,
  style: string,
  budgetShare: number,
  seed: number,
): FurnitureRow | null {
  const inCategory = catalog.filter((f) => f.category === category)
  if (!inCategory.length) return null
  const styled = inCategory.filter((f) => f.style === style)
  const pool = (styled.length >= 2 ? styled : inCategory)
    .slice()
    .sort((a, b) => b.popularity - a.popularity)
  const affordable = pool.filter((f) => f.price <= budgetShare)
  const candidates = affordable.length ? affordable : pool.slice(-2)
  return candidates[seed % candidates.length] ?? candidates[0]
}

export function buildAiPlan(input: {
  catalog: FurnitureRow[]
  roomType: string
  style: string
  budget: number
  mood?: string
  seed?: number
}): AiPlan {
  const { catalog, roomType } = input
  const style = STYLES.some((s) => s.id === input.style) ? input.style : 'scandinavian'
  const budget = Math.max(1200, Math.round(input.budget || 8000))
  const seed = input.seed ?? Math.floor(Math.random() * 97)

  const moodThemes = MOOD_THEMES[input.mood ?? 'soft'] ?? []
  const themeId =
    moodThemes[0] && input.mood
      ? moodThemes[seed % moodThemes.length]
      : STYLE_TO_THEME[style] ?? 'blush'
  const theme = getTheme(themeId)

  const categories = ROOM_CATEGORIES[roomType] ?? ROOM_CATEGORIES.living
  const weights: Record<string, number> = {
    sofa: 0.34,
    bed: 0.36,
    kitchen: 0.4,
    table: 0.2,
    desk: 0.22,
    wardrobe: 0.22,
    rug: 0.15,
    chair: 0.14,
    lamp: 0.07,
    plant: 0.06,
    decor: 0.05,
  }

  const picks: (FurnitureRow & { role: string })[] = []
  const usedIds = new Set<string>()
  for (const [index, category] of categories.entries()) {
    const share = budget * (weights[category] ?? 0.1) * 1.25
    let choice = pickForCategory(catalog, category, style, share, seed + index)
    if (choice && usedIds.has(choice.id)) {
      const alternatives = catalog.filter(
        (f) => f.category === category && !usedIds.has(f.id) && f.price <= share * 1.1,
      )
      choice = alternatives[0] ?? choice
    }
    if (!choice) continue
    usedIds.add(choice.id)
    picks.push({ ...choice, role: ROLE_LABEL[category] ?? 'A finishing piece' })
  }

  // Keep the plan inside the budget where possible
  let total = picks.reduce((sum, p) => sum + p.price, 0)
  if (total > budget) {
    const expensive = picks
      .map((p, i) => ({ p, i }))
      .sort((a, b) => b.p.price - a.p.price)
      .slice(0, 2)
    for (const { p } of expensive) {
      const cheaper = catalog
        .filter((f) => f.category === p.category && f.price < p.price && !usedIds.has(f.id))
        .sort((a, b) => a.price - b.price)[0]
      if (cheaper) {
        const idx = picks.findIndex((x) => x.id === p.id)
        if (idx >= 0) {
          picks[idx] = { ...cheaper, role: p.role }
          usedIds.delete(p.id)
          usedIds.add(cheaper.id)
        }
      }
    }
    total = picks.reduce((sum, p) => sum + p.price, 0)
  }

  const palette: AiPaletteColor[] = [
    { name: `${theme.name.split(' ')[0]} wall`, hex: theme.wall, note: 'A tinted neutral keeps the room bright without going flat.' },
    ...theme.swatches.slice(1, 4).map((hex, i) => ({
      name: ['Primary accent', 'Second accent', 'Wood tone'][i] ?? 'Accent',
      hex,
      note: EXTRA_NOTES[(seed + i) % EXTRA_NOTES.length],
    })),
    { name: 'Fresh green', hex: '#7FAE86', note: 'Plants do the last 5% that paint cannot.' },
  ]

  const styleLabel = STYLES.find((s) => s.id === style)?.label ?? 'Scandinavian'
  const roomLabel = roomType.charAt(0).toUpperCase() + roomType.slice(1)
  const cheap = total <= budget * 0.85

  const summary = `A ${styleLabel.toLowerCase()} ${roomLabel.toLowerCase()} built around ${picks
    .slice(0, 2)
    .map((p) => p.name.toLowerCase())
    .join(' and ')}. The palette stays low-contrast, with one deeper accent near the floor so the room reads grounded rather than sugary. ${
    cheap ? 'There is room left in the budget for art and a second lamp.' : 'This uses most of the budget — add plants last.'
  }`

  return {
    headline: `${theme.name} ${roomLabel}`,
    summary,
    themeId: theme.id,
    themeName: theme.name,
    palette,
    picks,
    total,
    budget,
    tips: [
      roomType === 'living'
        ? 'Leave 40–45 cm between the sofa and coffee table so the room still breathes.'
        : roomType === 'bedroom'
          ? 'Keep 60 cm of walking space on both sides of the bed if the room allows it.'
          : 'Pull furniture 8–10 cm off the walls — it makes small rooms feel considered.',
      'Layer three light sources: overhead, task and floor. Never just one.',
      `Repeat the wood tone at least twice (${picks.find((p) => p.category === 'table')?.material ?? 'oak'} works here).`,
      'Buy the rug before the art. Rugs set the scale of everything else.',
    ],
  }
}

export function roomDefaults(type: RoomTypeToken) {
  const theme = getTheme(type.theme)
  return { wall: theme.wall, floor: theme.floor, floorType: theme.floorType, theme: theme.id }
}
