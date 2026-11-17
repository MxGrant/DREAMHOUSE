import type { LayoutItem } from '@/lib/types'

/** Minimal sink so the seed can run against D1 in batches, or a local SQLite file. */
export type SeedSink = {
  query(sql: string, params?: unknown[]): Promise<void>
}

/**
 * PBKDF2 hashes (100k iterations, SHA-256) of the demo passwords.
 * Workers' Web Crypto rejects iteration counts above 100,000.
 */
const SEED_HASHES: Record<string, string> = {
  amelia: 'pbkdf2$100000$e1b083e53f15d1ff57820b1c130fad52$54d68bcf014ef879d12ee79ff580c8b4946590e8cda7d1e14b60840924dc7de5',
  juniper: 'pbkdf2$100000$a2b0d6c99d561eaadda0654032d2b05e$53a52cc17c17f993c86063d3b79bc0fd78ebf2b9607bf0434b5d1fe235d1ffbf',
  marco: 'pbkdf2$100000$3d31b344481c908e17768ec084621b96$ee673cbaa7f500384ade5c6904b10fce2e8c09d8f6532709473abc086aecc04a',
  sienna: 'pbkdf2$100000$ce995e8e64506c8e9ce8b2ee59cbe005$ab729a5b26d5f9d4e1273bf5d894db893a2b1f5de6642ccecb74794c0903a6f5',
  noah: 'pbkdf2$100000$cd2a66921a2af45d72a4fef78eb22bc7$bde481fe3a801fe3d338cc06dd3907f16e654117dfde7ab04d51f35a64a22d89',
}

type FurnSeed = {
  id: string
  name: string
  category: string
  style: string
  colorName: string
  color: string
  price: number
  width: number
  depth: number
  height: number
  material: string
  blurb: string
  popularity: number
}

const F = (
  id: string,
  name: string,
  category: string,
  style: string,
  colorName: string,
  color: string,
  price: number,
  width: number,
  depth: number,
  height: number,
  material: string,
  blurb: string,
  popularity: number,
): FurnSeed => ({
  id,
  name,
  category,
  style,
  colorName,
  color,
  price,
  width,
  depth,
  height,
  material,
  blurb,
  popularity,
})

export const FURNITURE: FurnSeed[] = [
  F('marlow-sofa', 'Marlow Bouclé Sofa', 'sofa', 'scandinavian', 'Cream bouclé', '#EDE4D8', 2299, 228, 96, 82, 'Bouclé wool', 'Deep feather-filled seats on a low oak plinth. The sofa everyone sinks into and refuses to leave.', 98),
  F('lindqvist-sofa', 'Lindqvist Linen 3-Seater', 'sofa', 'japandi', 'Oatmeal linen', '#D9CDBB', 1890, 214, 90, 78, 'Washed linen', 'Relaxed linen slipcover that softens with every wash, on a solid ash frame.', 91),
  F('rosalie-loveseat', 'Rosalie Velvet Loveseat', 'sofa', 'vintage', 'Dusty rose velvet', '#DE93A6', 1240, 165, 88, 80, 'Cotton velvet', 'A two-seat romantic with turned walnut legs and a gently curved back.', 84),
  F('freyja-corner-sofa', 'Freyja Modular Corner Sofa', 'sofa', 'modern', 'Sage weave', '#A9BFA8', 3290, 286, 192, 76, 'Performance weave', 'Deep modular corner with reversible chaise — built for film nights.', 88),
  F('penny-cloud-sofa', 'Penny Curved Cloud Sofa', 'sofa', 'boho', 'Ivory shearling', '#F0E7DA', 2760, 240, 110, 72, 'Shearling', 'One long curve of cloud-soft upholstery. A room-shaper all on its own.', 95),
  F('basil-two-seater', 'Basil Two-Seater', 'sofa', 'mid-century', 'Terracotta', '#C97C5D', 980, 168, 84, 76, 'Wool blend', 'Compact mid-century silhouette with tapered oak legs and piped cushions.', 79),
  F('ottoline-chair', 'Ottoline Accent Chair', 'chair', 'vintage', 'Mustard velvet', '#D9A63C', 690, 78, 82, 84, 'Velvet', 'A little jewel box of a chair with a scooped back and brass feet.', 87),
  F('aiko-rattan-chair', 'Aiko Rattan Lounge Chair', 'chair', 'boho', 'Natural rattan', '#C8A97E', 540, 76, 80, 78, 'Rattan & linen', 'Hand-woven rattan shell with a linen cushion, made for sunny corners.', 82),
  F('miro-lounge-chair', 'Miro Lounge Chair', 'chair', 'mid-century', 'Walnut & black leather', '#6E5544', 1150, 82, 86, 80, 'Leather & walnut', 'A reclined leather sling on a sculpted walnut frame.', 90),
  F('hallow-dining-chair', 'Hallow Oak Dining Chair', 'chair', 'scandinavian', 'Pale oak', '#D8B98F', 210, 46, 50, 82, 'Solid oak', 'Steam-bent back, woven paper seat, endlessly stackable.', 74),
  F('ines-dining-chair', 'Ines Velvet Dining Chair', 'chair', 'modern', 'Lilac velvet', '#B9A6E8', 265, 48, 54, 84, 'Velvet', 'Soft lilac upholstery with a slim brass frame — dinner-party favourite.', 77),
  F('peony-swivel-chair', 'Peony Bouclé Swivel Chair', 'chair', 'modern', 'Blush bouclé', '#F3C6CF', 780, 84, 84, 76, 'Bouclé', 'A full 360° swivel in candy-floss bouclé.', 93),
  F('petal-bar-stool', 'Petal Oak Bar Stool', 'chair', 'japandi', 'Oak', '#CFA97D', 190, 42, 42, 66, 'Oak', 'A rounded seat that tucks neatly under any island.', 68),
  F('sora-coffee-table', 'Sora Oak Coffee Table', 'table', 'japandi', 'Natural oak', '#D3B08A', 620, 110, 60, 38, 'Solid oak', 'Low, honest joinery with a soft chamfered edge.', 88),
  F('nellis-coffee-table', 'Nellis Travertine Coffee Table', 'table', 'modern', 'Travertine', '#E5D8C7', 940, 120, 70, 34, 'Travertine', 'A solid slab of honed travertine on two chunky feet.', 86),
  F('puddle-table', 'Round Puddle Table', 'table', 'boho', 'Limewashed wood', '#E9DCCB', 480, 90, 90, 40, 'Mango wood', 'A low round table with a limewashed top that catches afternoon light.', 72),
  F('alba-dining-table', 'Alba Dining Table', 'table', 'scandinavian', 'Oak', '#D5B48C', 1650, 180, 90, 75, 'Solid oak', 'Seats six comfortably with room for a seventh. Built to be inherited.', 89),
  F('fern-console-table', 'Fern Console Table', 'table', 'japandi', 'Ash', '#C9AE8C', 520, 120, 35, 78, 'Ash', 'Slim hallway console with a drawer for keys and letters.', 70),
  F('petite-side-table', 'Petite Round Side Table', 'table', 'vintage', 'Cream lacquer', '#F1E6D6', 190, 45, 45, 52, 'Lacquered wood', 'Little round companion for any armchair.', 75),
  F('cloud-bed', 'Cloud Nine Upholstered Bed', 'bed', 'modern', 'Cloud ivory', '#EFE6DA', 1980, 168, 215, 120, 'Performance linen', 'A padded headboard you can lean into with a book for hours.', 94),
  F('lull-bed', 'Lull Linen Platform Bed', 'bed', 'japandi', 'Oat linen', '#D9CBB6', 1420, 160, 210, 95, 'Linen', 'Low platform design that makes a small bedroom feel generous.', 85),
  F('rosalie-canopy-bed', 'Rosalie Canopy Bed', 'bed', 'vintage', 'Ivory & brass', '#E9DCC6', 2450, 158, 210, 190, 'Steel & linen', 'Slender brass posts with a linen canopy — dramatic in the best way.', 80),
  F('nook-bed', 'Nook Single Bed', 'bed', 'scandinavian', 'Pale oak', '#DCBE97', 780, 100, 200, 90, 'Oak', 'A neat single that grows with the room.', 71),
  F('willow-crib', 'Willow Crib', 'bed', 'scandinavian', 'White ash', '#F2EADF', 690, 130, 70, 95, 'Ash', 'Slatted crib with three mattress heights.', 66),
  F('arve-wardrobe', 'Arve Sliding Wardrobe', 'wardrobe', 'scandinavian', 'Oak & white', '#E8DCCB', 1890, 220, 62, 230, 'Oak veneer', 'Two metres of calm, behind soft-close sliding doors.', 87),
  F('linen-press', 'Linen Press Storage Cabinet', 'wardrobe', 'vintage', 'Warm cream', '#EFE2CF', 980, 110, 48, 190, 'Painted pine', 'Tall cupboard with shelves for linen, candles and clutter.', 73),
  F('elva-sideboard', 'Elva Rattan Sideboard', 'wardrobe', 'boho', 'Cane & oak', '#D9C09B', 1150, 160, 45, 75, 'Cane & oak', 'Woven cane doors that keep the light moving.', 81),
  F('cloud-dresser', 'Little Cloud Dresser', 'wardrobe', 'modern', 'Blush lacquer', '#F3D5DE', 740, 120, 48, 82, 'Lacquered MDF', 'Six drawers with scalloped handles, in the softest blush.', 78),
  F('poets-shelf', 'Poet’s Open Bookcase', 'wardrobe', 'japandi', 'Oak', '#D2B391', 640, 90, 35, 180, 'Oak', 'Five open shelves that make even a small stack of books look styled.', 76),
  F('bloom-floor-lamp', 'Bloom Floor Lamp', 'lamp', 'modern', 'Brass & linen', '#EBDCC0', 320, 40, 40, 165, 'Brass & linen', 'A tall brass stem topped with a generous linen drum.', 84),
  F('arc-paper-lamp', 'Arc Paper Floor Lamp', 'lamp', 'japandi', 'Rice paper', '#F4EBDC', 280, 38, 38, 158, 'Washi paper', 'Noguchi-inspired paper glow, warm and diffuse.', 79),
  F('mushroom-lamp', 'Mushroom Table Lamp', 'lamp', 'vintage', 'Mushroom pink', '#E9BFC4', 145, 26, 26, 42, 'Glass', 'A little glass mushroom that makes every surface feel styled.', 88),
  F('pebble-lamp', 'Pebble Ceramic Lamp', 'lamp', 'boho', 'Sand ceramic', '#E2D2BE', 180, 28, 28, 46, 'Ceramic', 'Hand-thrown stoneware base with a rumpled linen shade.', 74),
  F('halo-sconce', 'Halo Wall Sconce', 'lamp', 'minimalist', 'Opal glass', '#F6EFE3', 120, 18, 18, 30, 'Opal glass', 'A small globe of warm light for hallways and bedside walls.', 67),
  F('marrakesh-rug', 'Marrakesh Wool Rug', 'rug', 'boho', 'Terracotta & cream', '#DDB69C', 890, 200, 290, 2, 'Hand-knotted wool', 'Hand-knotted in the Atlas mountains, with a faded vintage pattern.', 90),
  F('cloud-pile-rug', 'Cloud Pile Rug', 'rug', 'modern', 'Cream', '#EFE6D8', 620, 160, 230, 3, 'Tufted wool', 'A dense, deep pile that feels like walking on a cloud.', 86),
  F('sage-jute-rug', 'Sage Jute Round Rug', 'rug', 'scandinavian', 'Sage jute', '#CBD5BA', 430, 180, 180, 2, 'Jute', 'Circular jute weave with a hand-stitched sage border.', 75),
  F('checker-rug', 'Checkerboard Wool Rug', 'rug', 'modern', 'Cream & cocoa', '#E4D6C2', 540, 200, 300, 2, 'Wool', 'An oversized checker that grounds a room instantly.', 83),
  F('vintage-wash-rug', 'Vintage Wash Rug', 'rug', 'vintage', 'Faded rose', '#DDB9B4', 480, 160, 230, 2, 'Wool', 'Sun-faded rose and sand, vintage in all the right places.', 72),
  F('fiddle-leaf', 'Fiddle Leaf Fig', 'plant', 'modern', 'Forest green', '#4F7A52', 210, 55, 55, 160, 'Living plant', 'A tall, glossy statement plant in a ribbed stone pot.', 89),
  F('monstera', 'Monstera Deliciosa', 'plant', 'boho', 'Deep green', '#3F6B46', 95, 60, 60, 110, 'Living plant', 'Architectural leaves that fenestrate as they grow.', 86),
  F('olive-tree', 'Potted Olive Tree', 'plant', 'japandi', 'Silver green', '#7C8C6A', 260, 55, 55, 150, 'Living plant', 'Silvery leaves that love a bright window.', 84),
  F('snake-plant', 'Snake Plant', 'plant', 'minimalist', 'Variegated green', '#5E7F58', 65, 30, 30, 80, 'Living plant', 'Almost impossible to kill, and looks excellent doing it.', 81),
  F('trailing-pothos', 'Trailing Pothos', 'plant', 'eclectic', 'Fresh green', '#5E8F55', 55, 28, 28, 40, 'Living plant', 'A generous trail of heart-shaped leaves.', 70),
  F('arch-mirror', 'Arch Wall Mirror', 'decor', 'modern', 'Brushed brass', '#D9C39B', 340, 80, 6, 180, 'Brass & glass', 'A tall arch that doubles the light in a small room.', 85),
  F('gallery-set', 'Gallery Frame Set of 4', 'decor', 'eclectic', 'Oak & paper', '#E3D3BE', 120, 60, 4, 80, 'Oak & paper', 'Four slim oak frames with curated art prints.', 69),
  F('vase-trio', 'Ceramic Vase Trio', 'decor', 'boho', 'Clay', '#D8BBA2', 85, 30, 30, 40, 'Stoneware', 'Three hand-thrown vases in graduated heights.', 73),
  F('woven-basket', 'Woven Storage Basket', 'decor', 'boho', 'Natural seagrass', '#D8C5A4', 60, 45, 45, 40, 'Seagrass', 'Holds blankets, toys, or nothing at all.', 64),
  F('candle-tray', 'Soy Candle & Tray', 'decor', 'minimalist', 'Blush ceramic', '#ECC9CE', 45, 30, 20, 8, 'Ceramic & soy wax', 'Bergamot and fig, in a reusable blush ceramic vessel.', 61),
  F('marble-island', 'Marble Kitchen Island', 'kitchen', 'modern', 'Calacatta marble', '#EDE7DE', 2400, 220, 100, 92, 'Marble & oak', 'A showpiece island with an oak base and honed marble top.', 92),
  F('oak-cabinet-run', 'Oak Cabinet Run', 'kitchen', 'scandinavian', 'Pale oak', '#DEC7A6', 3100, 300, 65, 90, 'Oak', 'Full-height lower cabinets with handless fronts.', 88),
  F('sage-cabinet-run', 'Sage Cabinet Run', 'kitchen', 'japandi', 'Sage', '#AFC2AF', 2860, 240, 65, 90, 'Painted oak', 'Soft sage cabinetry with slim brass pulls.', 85),
  F('retro-fridge', 'Retro Cream Fridge', 'kitchen', 'vintage', 'Cream enamel', '#F0E7D6', 1690, 70, 70, 180, 'Enamel steel', 'A rounded cream fridge that makes the kitchen feel lived in.', 82),
  F('farmhouse-sink', 'Farmhouse Sink Unit', 'kitchen', 'vintage', 'White fireclay', '#F3EDE4', 1240, 120, 65, 90, 'Fireclay', 'An apron sink set into a panelled cabinet.', 76),
  F('sage-range', 'Sage Range Cooker', 'kitchen', 'modern', 'Sage enamel', '#B4C6B0', 2100, 90, 65, 90, 'Enamel steel', 'Twin ovens and six burners, in a very good green.', 79),
  F('studio-desk', 'Studio Oak Desk', 'desk', 'scandinavian', 'Oak', '#D6B78F', 890, 160, 70, 75, 'Oak', 'A wide, quiet desk with two shallow drawers.', 87),
  F('writing-bureau', 'Writing Bureau', 'desk', 'vintage', 'Walnut', '#8A674C', 720, 100, 50, 90, 'Walnut', 'Drop-leaf bureau with cubbies for letters.', 71),
  F('floating-desk', 'Floating Wall Desk', 'desk', 'minimalist', 'White ash', '#EFE7DA', 480, 110, 45, 75, 'Ash', 'A wall-mounted desk that leaves the floor clear.', 68),
]

const uid = () => crypto.randomUUID()

function pick(category: string, style: string, offset = 0): FurnSeed | undefined {
  const byStyle = FURNITURE.filter((f) => f.category === category && f.style === style)
  const pool = byStyle.length ? byStyle : FURNITURE.filter((f) => f.category === category)
  if (!pool.length) return undefined
  return pool[Math.abs(offset) % pool.length]
}

type Placement = { x: number; y: number; rotation?: number }

function item(seed: FurnSeed | undefined, p: Placement): LayoutItem | null {
  if (!seed) return null
  return {
    id: uid(),
    furnitureId: seed.id,
    name: seed.name,
    category: seed.category,
    x: Math.round(p.x),
    y: Math.round(p.y),
    w: seed.width,
    d: seed.depth,
    h: seed.height,
    rotation: p.rotation ?? 0,
    color: seed.color,
    price: seed.price,
  }
}

function extents(i: LayoutItem) {
  const rad = (i.rotation * Math.PI) / 180
  const c = Math.abs(Math.cos(rad))
  const s = Math.abs(Math.sin(rad))
  return { w: i.w * c + i.d * s, d: i.w * s + i.d * c }
}

function overlaps(a: LayoutItem, b: LayoutItem) {
  const ea = extents(a)
  const eb = extents(b)
  return (
    Math.abs(a.x - b.x) < (ea.w + eb.w) / 2 - 4 &&
    Math.abs(a.y - b.y) < (ea.d + eb.d) / 2 - 4
  )
}

function clampToRoom(i: LayoutItem, roomW: number, roomL: number) {
  const e = extents(i)
  const minX = e.w / 2 + 6
  const maxX = roomW - e.w / 2 - 6
  const minY = e.d / 2 + 6
  const maxY = roomL - e.d / 2 - 6
  i.x = Math.round(Math.min(Math.max(i.x, minX), Math.max(minX, maxX)))
  i.y = Math.round(Math.min(Math.max(i.y, minY), Math.max(minY, maxY)))
  return i
}

/** Builds a believable, collision-free furnished room. */
export function buildRoomLayout(
  roomType: string,
  w: number,
  l: number,
  style: string,
  variant = 0,
): LayoutItem[] {
  const items: LayoutItem[] = []
  const place = (seed: FurnSeed | undefined, p: Placement) => {
    const it = item(seed, p)
    if (!it) return
    clampToRoom(it, w, l)
    if (it.category !== 'rug' && items.some((o) => o.category !== 'rug' && overlaps(o, it))) return
    items.push(it)
  }
  const cx = w / 2
  const cy = l / 2

  if (roomType === 'living') {
    place(pick('rug', style, variant), { x: cx, y: cy + 40 })
    place(pick('sofa', style, variant), { x: cx, y: 30 })
    place(pick('table', style, variant), { x: cx, y: cy + 30 })
    place(pick('chair', style, variant + 1), { x: w - 90, y: cy + 110, rotation: -18 })
    place(pick('lamp', style, variant), { x: 55, y: 210 })
    place(pick('plant', style, variant), { x: w - 55, y: l - 65 })
    place(pick('wardrobe', style, variant + 1), { x: w * 0.32, y: l - 26 })
    place(pick('decor', style, variant), { x: w * 0.62, y: l - 40 })
  } else if (roomType === 'bedroom') {
    place(pick('rug', style, variant), { x: cx, y: l * 0.62 })
    place(pick('bed', style, variant), { x: cx, y: 30 })
    place(pick('table', style, variant + 1), { x: cx - 115, y: 45 })
    place(pick('table', style, variant + 2), { x: cx + 115, y: 45 })
    place(pick('wardrobe', style, variant), { x: w * 0.3, y: l - 25 })
    place(pick('chair', style, variant + 2), { x: w - 65, y: l * 0.6, rotation: -25 })
    place(pick('lamp', style, variant + 1), { x: w - 55, y: l * 0.6 - 110 })
    place(pick('plant', style, variant + 1), { x: 50, y: l - 55 })
  } else if (roomType === 'dining') {
    place(pick('rug', style, variant), { x: cx, y: cy + 20 })
    place(pick('table', style, variant + 0), { x: cx, y: cy })
    const dining = pick('table', style, 0)
    const tableW = dining?.width ?? 180
    const tableD = dining?.depth ?? 90
    place(pick('chair', style, 0), { x: cx - tableW * 0.28, y: cy - tableD / 2 - 28, rotation: 0 })
    place(pick('chair', style, 0), { x: cx + tableW * 0.28, y: cy - tableD / 2 - 28, rotation: 0 })
    place(pick('chair', style, 0), { x: cx - tableW * 0.28, y: cy + tableD / 2 + 28, rotation: 180 })
    place(pick('chair', style, 0), { x: cx + tableW * 0.28, y: cy + tableD / 2 + 28, rotation: 180 })
    place(pick('chair', style, 1), { x: cx - tableW / 2 - 27, y: cy, rotation: -90 })
    place(pick('chair', style, 1), { x: cx + tableW / 2 + 27, y: cy, rotation: 90 })
    place(pick('wardrobe', style, variant + 2), { x: cx, y: 24 })
    place(pick('plant', style, variant), { x: w - 45, y: l - 45 })
    place(pick('lamp', style, variant + 2), { x: 45, y: l - 45 })
  } else if (roomType === 'kitchen') {
    place(pick('kitchen', style, 0), { x: cx, y: 34 })
    place(pick('kitchen', style, 1), { x: cx, y: cy + 20 })
    place(pick('chair', style, 2), { x: cx - 65, y: cy + 95 })
    place(pick('chair', style, 2), { x: cx + 65, y: cy + 95 })
    place(pick('kitchen', style, 2), { x: 42, y: 150 })
    place(pick('plant', style, variant), { x: w - 45, y: l - 45 })
    place(pick('rug', style, variant), { x: cx, y: l - 70 })
    place(pick('decor', style, variant), { x: w - 100, y: l - 40 })
  } else if (roomType === 'study') {
    place(pick('rug', style, variant), { x: cx, y: cy + 40 })
    place(pick('desk', style, 0), { x: cx, y: 40 })
    place(pick('chair', style, 3), { x: cx, y: 130 })
    place(pick('wardrobe', style, 2), { x: 30, y: cy + 30, rotation: 0 })
    place(pick('chair', style, 1), { x: w - 60, y: l - 90, rotation: -20 })
    place(pick('plant', style, variant), { x: 45, y: l - 45 })
    place(pick('lamp', style, variant), { x: w - 40, y: 60 })
  } else if (roomType === 'nursery') {
    place(pick('rug', style, variant), { x: cx, y: cy + 60 })
    place(pick('bed', style, 4), { x: cx, y: 30 })
    place(pick('wardrobe', style, 3), { x: w * 0.3, y: l - 30 })
    place(pick('chair', style, 2), { x: w - 70, y: cy + 60, rotation: -20 })
    place(pick('lamp', style, 1), { x: w - 55, y: cy - 30 })
    place(pick('plant', style, variant), { x: 40, y: l - 50 })
    place(pick('decor', style, variant), { x: cx + 70, y: l - 50 })
  } else {
    place(pick('rug', style, variant), { x: cx, y: cy + 50 })
    place(pick('desk', style, variant), { x: cx, y: 40 })
    place(pick('chair', style, 3), { x: cx, y: 125 })
    place(pick('wardrobe', style, 4), { x: w * 0.25, y: l - 25 })
    place(pick('plant', style, variant), { x: w - 45, y: l - 50 })
    place(pick('lamp', style, variant + 1), { x: 40, y: l - 60 })
    place(pick('decor', style, variant), { x: cx + 80, y: l - 45 })
  }
  return items
}

type RoomSeed = {
  name: string
  type: string
  width?: number
  length?: number
  theme?: string
  extraLayouts?: { name: string; variant: number }[]
}

type HouseSeed = {
  key: string
  owner: string
  name: string
  description: string
  cover: string
  style: string
  theme: string
  budget: number
  isPublic: boolean
  rooms: RoomSeed[]
  daysAgo: number
}

const USERS = [
  {
    key: 'amelia',
    name: 'Amelia Laurent',
    email: 'demo@dreamhouse.studio',
    password: 'demo1234',
    handle: 'amelia',
    bio: 'Interior stylist in Copenhagen. Soft palettes, old wood, too many cushions.',
    location: 'Copenhagen, DK',
    hue: 335,
    designer: true,
  },
  {
    key: 'juniper',
    name: 'Juniper Vale',
    email: 'juniper@dreamhouse.studio',
    password: 'juniper123',
    handle: 'juniper',
    bio: 'Designing pastel penthouses and collecting mid-century lamps.',
    location: 'Lisbon, PT',
    hue: 272,
    designer: true,
  },
  {
    key: 'marco',
    name: 'Marco Bellini',
    email: 'marco@dreamhouse.studio',
    password: 'marco1234',
    handle: 'marco',
    bio: 'Kitchens, marble and very strong espresso. Milan.',
    location: 'Milan, IT',
    hue: 14,
    designer: true,
  },
  {
    key: 'sienna',
    name: 'Sienna Okoro',
    email: 'sienna@dreamhouse.studio',
    password: 'sienna123',
    handle: 'sienna',
    bio: 'Bedrooms that feel like a deep breath. Textile obsessive.',
    location: 'London, UK',
    hue: 158,
    designer: true,
  },
  {
    key: 'noah',
    name: 'Noah Bergström',
    email: 'noah@dreamhouse.studio',
    password: 'noah1234',
    handle: 'noah',
    bio: 'Small apartments, big ideas.',
    location: 'Stockholm, SE',
    hue: 205,
    designer: false,
  },
]

const HOUSES: HouseSeed[] = [
  {
    key: 'blush-apartment',
    owner: 'amelia',
    name: 'The Blush Apartment',
    description:
      'A 62 m² city apartment layered in powder pink, warm oak and too many plants. Every room was planned here first — including the sofa that took four tries to place.',
    cover: '/homes/living-linen.jpg',
    style: 'scandinavian',
    theme: 'blush',
    budget: 9500,
    isPublic: true,
    daysAgo: 12,
    rooms: [
      { name: 'Hollyhock Living Room', type: 'living', extraLayouts: [{ name: 'Evening hosting', variant: 2 }] },
      { name: 'Powder Bedroom', type: 'bedroom', theme: 'lavender' },
      { name: 'Little Study', type: 'study', theme: 'sage' },
    ],
  },
  {
    key: 'lavender-loft',
    owner: 'amelia',
    name: 'Lavender Loft',
    description:
      'An open loft in soft lilac. Fewer things, chosen slowly — a linen sofa, a paper lamp and a table big enough for everyone.',
    cover: '/homes/living-nordic.jpg',
    style: 'japandi',
    theme: 'lavender',
    budget: 12200,
    isPublic: true,
    daysAgo: 26,
    rooms: [
      { name: 'Loft Living', type: 'living', length: 600 },
      { name: 'Reading Room', type: 'study', theme: 'lavender' },
      { name: 'Quiet Bedroom', type: 'bedroom', theme: 'cream' },
    ],
  },
  {
    key: 'peach-studio',
    owner: 'amelia',
    name: 'Peach Blossom Studio',
    description: 'A sunny studio corner for a ceramicist: one desk, one chair, one very good lamp.',
    cover: '/homes/living-cosy.jpg',
    style: 'boho',
    theme: 'peach',
    budget: 6400,
    isPublic: false,
    daysAgo: 4,
    rooms: [{ name: 'Studio Corner', type: 'studio', theme: 'peach' }],
  },
  {
    key: 'mint-kitchen',
    owner: 'amelia',
    name: 'Mint Kitchen House',
    description: 'The kitchen renovation, planned to the centimetre. Sage cabinets, marble island, a stool for every friend.',
    cover: '/homes/kitchen-marble.jpg',
    style: 'modern',
    theme: 'mint',
    budget: 15000,
    isPublic: false,
    daysAgo: 2,
    rooms: [
      { name: 'Marble Kitchen', type: 'kitchen' },
      { name: 'Breakfast Nook', type: 'dining', theme: 'mint' },
    ],
  },
  {
    key: 'pastel-penthouse',
    owner: 'juniper',
    name: 'The Pastel Penthouse',
    description:
      'Floor-to-ceiling glass, cream bouclé and a rug large enough to nap on. The living room is arranged around the light.',
    cover: '/homes/living-penthouse.jpg',
    style: 'modern',
    theme: 'blush',
    budget: 24000,
    isPublic: true,
    daysAgo: 7,
    rooms: [
      { name: 'Glass Living Room', type: 'living', width: 560, length: 680, extraLayouts: [{ name: 'Party layout', variant: 3 }] },
      { name: 'Travertine Dining', type: 'dining', theme: 'peach' },
      { name: 'Lilac Study', type: 'study', theme: 'lavender' },
    ],
  },
  {
    key: 'green-room',
    owner: 'juniper',
    name: 'The Green Room',
    description: 'A dark green study for a collector of prints, mid-century chairs and very small lamps.',
    cover: '/homes/study-green.jpg',
    style: 'vintage',
    theme: 'sage',
    budget: 5200,
    isPublic: true,
    daysAgo: 31,
    rooms: [{ name: 'Green Study', type: 'study', theme: 'sage' }],
  },
  {
    key: 'marble-mint-villa',
    owner: 'marco',
    name: 'Marble & Mint Villa',
    description: 'A cook’s kitchen: two islands, sage joinery, a fridge you want to keep open just to look at.',
    cover: '/homes/kitchen-marble.jpg',
    style: 'modern',
    theme: 'mint',
    budget: 31000,
    isPublic: true,
    daysAgo: 18,
    rooms: [
      { name: 'Main Kitchen', type: 'kitchen', width: 420, length: 520 },
      { name: 'Long Dining Room', type: 'dining', theme: 'mint' },
      { name: 'Garden Living', type: 'living', theme: 'mint' },
    ],
  },
  {
    key: 'terracotta-table',
    owner: 'marco',
    name: 'The Terracotta Table',
    description: 'One long table, six mismatched chairs, a rug from Marrakesh and a lamp for late talkers.',
    cover: '/homes/dining-warm.jpg',
    style: 'boho',
    theme: 'peach',
    budget: 7800,
    isPublic: true,
    daysAgo: 9,
    rooms: [{ name: 'Dinner Room', type: 'dining', theme: 'peach' }],
  },
  {
    key: 'cloud-nine',
    owner: 'sienna',
    name: 'Cloud Nine Bedroom',
    description: 'Everything in this room is soft. Bouclé bed, cloud rug, blush dresser, low warm light.',
    cover: '/homes/bedroom-boucle.jpg',
    style: 'scandinavian',
    theme: 'lavender',
    budget: 6200,
    isPublic: true,
    daysAgo: 3,
    rooms: [
      { name: 'Cloud Bedroom', type: 'bedroom', extraLayouts: [{ name: 'Summer reset', variant: 1 }] },
    ],
  },
  {
    key: 'sunlit-sanctuary',
    owner: 'sienna',
    name: 'Sunlit Sanctuary',
    description: 'A cream-and-cane apartment that catches the sun from ten until four.',
    cover: '/homes/living-bright.jpg',
    style: 'boho',
    theme: 'cream',
    budget: 8600,
    isPublic: true,
    daysAgo: 21,
    rooms: [
      { name: 'Sunlit Living', type: 'living', theme: 'cream' },
      { name: 'Linen Bedroom', type: 'bedroom', theme: 'cream' },
    ],
  },
  {
    key: 'nordic-nest',
    owner: 'noah',
    name: 'Nordic Nest',
    description: 'Forty square metres, eleven plants and a sofa that folds into a bed.',
    cover: '/homes/living-nordic.jpg',
    style: 'scandinavian',
    theme: 'cream',
    budget: 5400,
    isPublic: true,
    daysAgo: 15,
    rooms: [
      { name: 'Everything Room', type: 'living', width: 380, length: 460 },
      { name: 'Sleep Nook', type: 'bedroom', theme: 'cream', width: 300, length: 340 },
    ],
  },
]

const COMMENTS: Record<string, string[]> = {
  'blush-apartment': [
    'The oak console under the window is such a good call — stealing this for my hallway.',
    'How did you get the rug to sit so perfectly with the sofa?',
    'Saving this whole house for my autumn refresh.',
  ],
  'pastel-penthouse': [
    'That curved sofa is a sculpture. Obsessed.',
    'The travertine table with the lilac chairs is a genius pairing.',
  ],
  'cloud-nine': ['This is the exact colour palette I have been trying to describe for months.', 'Bedroom goals, genuinely.'],
  'marble-mint-villa': ['Two islands is the correct number of islands.', 'The sage range cooker!!'],
  'terracotta-table': ['Those mismatched velvet chairs make the room.', 'Warm, generous, perfect.'],
  'green-room': ['Dark green walls + walnut bureau = chef’s kiss.', 'Where is the little mushroom lamp from?'],
  'sunlit-sanctuary': ['That cane sideboard is beautiful.', 'So much light. What a lovely space.'],
}

const MOODBOARDS = [
  {
    owner: 'amelia',
    title: 'Slow Mornings',
    description: 'The palette I keep coming back to: warm cream, blush ceramic, a little brass.',
    theme: 'cream',
    items: [
      { kind: 'color', title: 'Powder blush', color: '#F6C9D6' },
      { kind: 'color', title: 'Buttermilk', color: '#FBF6EE' },
      { kind: 'color', title: 'Warm oak', color: '#D5B48C' },
      { kind: 'image', title: 'Sunday light', image: '/homes/bedroom-boucle.jpg' },
      { kind: 'furniture', ref: 'cloud-bed', title: 'Cloud Nine Upholstered Bed' },
      { kind: 'furniture', ref: 'mushroom-lamp', title: 'Mushroom Table Lamp' },
      { kind: 'note', title: 'Rule', body: 'Nothing in the bedroom is allowed to be shiny. Linen, wool, ceramic, wood.' },
    ],
  },
  {
    owner: 'juniper',
    title: 'Apricot Hour',
    description: 'For the dining room: apricot, terracotta and one very loud mustard chair.',
    theme: 'peach',
    items: [
      { kind: 'color', title: 'Apricot', color: '#F7C6A7' },
      { kind: 'color', title: 'Terracotta', color: '#C97C5D' },
      { kind: 'image', title: 'Long table energy', image: '/homes/dining-warm.jpg' },
      { kind: 'furniture', ref: 'alba-dining-table', title: 'Alba Dining Table' },
      { kind: 'furniture', ref: 'ines-dining-chair', title: 'Ines Velvet Dining Chair' },
      { kind: 'note', title: 'Hosting', body: 'Seats six, stretches to eight. Candles always, overhead light never.' },
    ],
  },
  {
    owner: 'sienna',
    title: 'Cloud Bedroom',
    description: 'Soft, low-contrast, cocooning. Everything within reach of the bed.',
    theme: 'lavender',
    items: [
      { kind: 'color', title: 'Lilac mist', color: '#F4EFFF' },
      { kind: 'color', title: 'Cloud ivory', color: '#EFE6DA' },
      { kind: 'image', title: 'Bouclé bed', image: '/homes/bedroom-cloud.jpg' },
      { kind: 'furniture', ref: 'cloud-pile-rug', title: 'Cloud Pile Rug' },
      { kind: 'furniture', ref: 'cloud-dresser', title: 'Little Cloud Dresser' },
      { kind: 'note', title: 'Lighting', body: 'Two lamps, both warm, both dimmable. No downlights.' },
    ],
  },
]

/** Demo account hashes keyed by email, used to migrate earlier deploys. */
export const SEED_PASSWORD_HASHES: Record<string, string> = Object.fromEntries(
  USERS.map((user) => [user.email, SEED_HASHES[user.key]]),
)

export async function seedDatabase(db: SeedSink): Promise<void> {
  const userIds: Record<string, string> = {}
  for (const u of USERS) {
    const id = uid()
    userIds[u.key] = id
    await db.query(
      `INSERT INTO users (id, name, email, password_hash, handle, bio, location, avatar_hue, is_designer)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, u.name, u.email, SEED_HASHES[u.key], u.handle, u.bio, u.location, u.hue, u.designer],
    )
  }

  for (const f of FURNITURE) {
    await db.query(
      `INSERT INTO furniture (id, name, category, style, color_name, color, price, width, depth, height, material, blurb, popularity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [f.id, f.name, f.category, f.style, f.colorName, f.color, f.price, f.width, f.depth, f.height, f.material, f.blurb, f.popularity],
    )
  }

  const houseIds: Record<string, string> = {}
  const houseOwners: Record<string, string> = {}
  for (const h of HOUSES) {
    const id = uid()
    houseIds[h.key] = id
    houseOwners[h.key] = h.owner
    const created = new Date(Date.now() - h.daysAgo * 86400000).toISOString()
    await db.query(
      `INSERT INTO houses (id, user_id, name, description, cover_image, style, theme, budget, is_public, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)`,
      [id, userIds[h.owner], h.name, h.description, h.cover, h.style, h.theme, h.budget, h.isPublic, created],
    )

    let sort = 0
    for (const r of h.rooms) {
      const theme = r.theme ?? h.theme
      const themeMap: Record<string, [string, string, string]> = {
        blush: ['#FFF0F4', 'oak', '#E3C3A1'],
        lavender: ['#F4EFFF', 'washed', '#E6D8C8'],
        mint: ['#EDF9F2', 'oak', '#DCC6A9'],
        peach: ['#FFF2E8', 'terracotta', '#D9B08D'],
        cream: ['#FBF6EE', 'washed', '#E2D3BF'],
        sage: ['#F1F5ED', 'walnut', '#B98D6A'],
      }
      const [wall, floorType, floor] = themeMap[theme] ?? themeMap.blush
      const roomId = uid()
      const width = r.width ?? 420
      const length = r.length ?? 520
      await db.query(
        `INSERT INTO rooms (id, house_id, name, type, width_cm, length_cm, wall_color, floor_type, floor_color, theme, sort, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'))`,
        [roomId, id, r.name, r.type, width, length, wall, floorType, floor, theme, sort++],
      )

      const layouts: { name: string; variant: number }[] = [
        { name: 'Signature layout', variant: 0 },
        ...(r.extraLayouts ?? []),
      ]
      let activeId: string | null = null
      for (const [idx, lay] of layouts.entries()) {
        const layoutId = uid()
        const items = buildRoomLayout(r.type, width, length, h.style, lay.variant)
        await db.query(`INSERT INTO layouts (id, room_id, name, items, updated_at) VALUES ($1,$2,$3,$4,strftime('%Y-%m-%dT%H:%M:%fZ','now'))`, [
          layoutId,
          roomId,
          lay.name,
          JSON.stringify(items),
        ])
        if (idx === 0) activeId = layoutId
      }
      await db.query(`UPDATE rooms SET active_layout_id = $1 WHERE id = $2`, [activeId, roomId])
    }
  }

  // Social graph
  const follows: [string, string][] = [
    ['amelia', 'juniper'],
    ['amelia', 'sienna'],
    ['amelia', 'marco'],
    ['juniper', 'amelia'],
    ['sienna', 'amelia'],
    ['marco', 'amelia'],
    ['noah', 'amelia'],
    ['noah', 'juniper'],
    ['sienna', 'juniper'],
  ]
  for (const [a, b] of follows) {
    await db.query('INSERT INTO follows (follower_id, following_id) VALUES ($1,$2)', [userIds[a], userIds[b]])
  }

  // Likes from everyone except the owner
  for (const h of HOUSES.filter((x) => x.isPublic)) {
    for (const u of USERS) {
      if (u.key === h.owner) continue
      if (u.key === 'noah' && h.key === 'nordic-nest') continue
      await db.query('INSERT INTO likes (user_id, house_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
        userIds[u.key],
        houseIds[h.key],
      ])
    }
  }

  const savedPairs: [string, string][] = [
    ['amelia', 'cloud-nine'],
    ['amelia', 'pastel-penthouse'],
    ['amelia', 'terracotta-table'],
    ['juniper', 'blush-apartment'],
    ['sienna', 'blush-apartment'],
    ['sienna', 'pastel-penthouse'],
    ['marco', 'sunlit-sanctuary'],
    ['noah', 'blush-apartment'],
  ]
  for (const [u, h] of savedPairs) {
    await db.query('INSERT INTO saves (user_id, house_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
      userIds[u],
      houseIds[h],
    ])
  }

  for (const [houseKey, bodies] of Object.entries(COMMENTS)) {
    const commenterKeys = Object.keys(userIds).filter((k) => k !== houseOwners[houseKey])
    for (const [idx, body] of bodies.entries()) {
      await db.query('INSERT INTO comments (id, house_id, user_id, body, created_at) VALUES ($1,$2,$3,$4,$5)', [
        uid(),
        houseIds[houseKey],
        userIds[commenterKeys[idx % commenterKeys.length]],
        body,
        new Date(Date.now() - (idx + 1) * 36 * 3600000).toISOString(),
      ])
    }
  }

  const collections = [
    {
      owner: 'amelia',
      title: 'Sunday Living',
      description: 'Rooms for a slow day: big sofas, soft light, nowhere to be.',
      isPublic: true,
      houses: ['pastel-penthouse', 'sunlit-sanctuary', 'cloud-nine'],
    },
    {
      owner: 'marco',
      title: 'Kitchens I Would Cook In',
      description: 'Marble, sage, and a stool for every guest.',
      isPublic: true,
      houses: ['marble-mint-villa', 'blush-apartment'],
    },
    {
      owner: 'sienna',
      title: 'Soft Bedrooms',
      description: 'Cocooning rooms with low light and high pile.',
      isPublic: true,
      houses: ['cloud-nine', 'lavender-loft'],
    },
    {
      owner: 'amelia',
      title: 'Private wishlist',
      description: 'Things I am saving for the next flat.',
      isPublic: false,
      houses: ['terracotta-table'],
    },
  ]
  for (const c of collections) {
    const cid = uid()
    await db.query('INSERT INTO collections (id, user_id, title, description, is_public) VALUES ($1,$2,$3,$4,$5)', [
      cid,
      userIds[c.owner],
      c.title,
      c.description,
      c.isPublic,
    ])
    for (const key of c.houses) {
      await db.query('INSERT INTO collection_houses (collection_id, house_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
        cid,
        houseIds[key],
      ])
    }
  }

  for (const m of MOODBOARDS) {
    const mid = uid()
    await db.query(
      'INSERT INTO moodboards (id, user_id, title, description, theme, is_public) VALUES ($1,$2,$3,$4,$5,$6)',
      [mid, userIds[m.owner], m.title, m.description, m.theme, true],
    )
    for (const [i, it] of m.items.entries()) {
      await db.query(
        `INSERT INTO moodboard_items (id, moodboard_id, kind, ref_id, title, body, color, image, sort)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          uid(),
          mid,
          it.kind,
          'ref' in it ? it.ref : null,
          it.title,
          'body' in it ? (it.body as string) : '',
          'color' in it ? (it.color as string) : null,
          'image' in it ? (it.image as string) : null,
          i,
        ],
      )
    }
  }
}
