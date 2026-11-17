import { getFurniture } from '@/lib/data'
import { buildAiPlan } from '@/lib/ai'
import { body, clampInt, errorResponse, json, str } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const data = await body<{ roomType?: string; style?: string; budget?: number; mood?: string; seed?: number }>(req)
    const catalog = await getFurniture()
    const plan = buildAiPlan({
      catalog,
      roomType: str(data.roomType, 'living'),
      style: str(data.style, 'scandinavian'),
      budget: clampInt(data.budget, 500, 500000, 8000),
      mood: str(data.mood, 'soft'),
      seed: logoSeed(data.seed),
    })
    return json({ plan })
  } catch (err) {
    return errorResponse(err)
  }
}

function logoSeed(seed: unknown): number {
  const n = Number(seed)
  if (Number.isFinite(n)) return Math.abs(Math.floor(n)) % 97
  return Math.floor(Math.random() * 97)
}
