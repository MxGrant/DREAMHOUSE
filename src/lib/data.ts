import { one, query } from '@/db'
import type {
  CollectionRow,
  CommentRow,
  FurnitureRow,
  HouseCardData,
  LayoutItem,
  LayoutRow,
  MoodboardItemRow,
  MoodboardRow,
  RoomRow,
  UserRow,
} from './types'

export function parseItems(value: unknown): LayoutItem[] {
  if (Array.isArray(value)) return value as LayoutItem[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as LayoutItem[]) : []
    } catch {
      return []
    }
  }
  return []
}

const CARD_SELECT = `
SELECT h.id, h.user_id, h.name, h.description, h.cover_image, h.style, h.theme, h.budget,
       h.is_public, h.created_at, h.updated_at,
       u.name AS author_name, u.handle AS author_handle, u.avatar_hue AS author_hue,
       (SELECT count(*)::int FROM rooms r WHERE r.house_id = h.id) AS room_count,
       (SELECT count(*)::int FROM likes l WHERE l.house_id = h.id) AS like_count,
       (SELECT count(*)::int FROM saves s WHERE s.house_id = h.id) AS save_count,
       EXISTS(SELECT 1 FROM likes l WHERE l.house_id = h.id AND l.user_id = $1) AS liked,
       EXISTS(SELECT 1 FROM saves s WHERE s.house_id = h.id AND s.user_id = $1) AS saved,
       COALESCE((SELECT array_agg(DISTINCT r2.type) FROM rooms r2 WHERE r2.house_id = h.id), ARRAY[]::text[]) AS room_types
FROM houses h
JOIN users u ON u.id = h.user_id
`

export type ListHouseOptions = {
  viewerId?: string | null
  style?: string | null
  roomType?: string | null
  sort?: string
  authorId?: string | null
  savedBy?: string | null
  includePrivate?: boolean
  limit?: number
}

export async function listHouses(opts: ListHouseOptions = {}): Promise<HouseCardData[]> {
  const params: unknown[] = [opts.viewerId ?? '']
  let where = ' WHERE true'
  if (!opts.includePrivate) where += ' AND (h.is_public = true OR h.user_id = $1)'
  if (opts.style) {
    params.push(opts.style)
    where += ` AND h.style = $${params.length}`
  }
  if (opts.roomType) {
    params.push(opts.roomType)
    where += ` AND EXISTS (SELECT 1 FROM rooms rr WHERE rr.house_id = h.id AND rr.type = $${params.length})`
  }
  if (opts.authorId) {
    params.push(opts.authorId)
    where += ` AND h.user_id = $${params.length}`
  }
  if (opts.savedBy) {
    params.push(opts.savedBy)
    where += ` AND EXISTS (SELECT 1 FROM saves ss WHERE ss.house_id = h.id AND ss.user_id = $${params.length})`
  }
  let order =
    ' ORDER BY ((SELECT count(*)::int FROM likes l WHERE l.house_id = h.id) * 2 + (SELECT count(*)::int FROM saves s WHERE s.house_id = h.id) * 3) DESC, h.created_at DESC'
  if (opts.sort === 'newest') order = ' ORDER BY h.created_at DESC'
  if (opts.sort === 'budget') order = ' ORDER BY h.budget DESC'
  if (opts.sort === 'rooms') order = ' ORDER BY (SELECT count(*)::int FROM rooms r WHERE r.house_id = h.id) DESC'
  const limit = opts.limit ? ` LIMIT ${Math.max(1, Math.floor(opts.limit))}` : ' LIMIT 60'
  return query<HouseCardData>(CARD_SELECT + where + order + limit, params)
}

export async function getHouseCard(id: string, viewerId?: string | null): Promise<HouseCardData | null> {
  return one<HouseCardData>(`${CARD_SELECT} WHERE h.id = $2`, [viewerId ?? '', id])
}

export async function getRoomsOfHouse(houseId: string) {
  return query<RoomRow & { item_count: number; total: number }>(
    `SELECT r.*,
       COALESCE(jsonb_array_length(l.items), 0) AS item_count,
       COALESCE((SELECT SUM((it->>'price')::int) FROM jsonb_array_elements(l.items) it), 0) AS total
     FROM rooms r
     LEFT JOIN layouts l ON l.id = r.active_layout_id
     WHERE r.house_id = $1
     ORDER BY r.sort ASC, r.created_at ASC`,
    [houseId],
  )
}

export async function getRoom(roomId: string): Promise<RoomRow | null> {
  return one<RoomRow>('SELECT * FROM rooms WHERE id = $1', [roomId])
}

export async function getRoomBundle(roomId: string) {
  const room = await getRoom(roomId)
  if (!room) return null
  const house = await one<{ id: string; name: string; user_id: string; budget: number; style: string; is_public: boolean }>(
    'SELECT id, name, user_id, budget, style, is_public FROM houses WHERE id = $1',
    [room.house_id],
  )
  const layouts = await query<LayoutRow>(
    'SELECT id, room_id, name, items, updated_at FROM layouts WHERE room_id = $1 ORDER BY updated_at DESC',
    [roomId],
  )
  const active = layouts.find((l) => l.id === room.active_layout_id) ?? layouts[0] ?? null
  return {
    room,
    house,
    layouts: layouts.map((l) => ({ ...l, items: parseItems(l.items) })),
    active: active ? { ...active, items: parseItems(active.items) } : null,
  }
}

export async function getComments(houseId: string) {
  return query<CommentRow & { author_name: string; author_handle: string; author_hue: number }>(
    `SELECT c.*, u.name AS author_name, u.handle AS author_handle, u.avatar_hue AS author_hue
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.house_id = $1 ORDER BY c.created_at DESC`,
    [houseId],
  )
}

export async function getFurniture(filters?: {
  category?: string | null
  style?: string | null
  color?: string | null
  search?: string | null
  sort?: string | null
}): Promise<FurnitureRow[]> {
  const params: unknown[] = []
  let where = ' WHERE true'
  if (filters?.category) {
    params.push(filters.category)
    where += ` AND category = $${params.length}`
  }
  if (filters?.style) {
    params.push(filters.style)
    where += ` AND style = $${params.length}`
  }
  if (filters?.color) {
    params.push(`%${filters.color}%`)
    const fuzzy = params.length
    params.push(filters.color)
    where += ` AND (color_name ILIKE $${fuzzy} OR color = $${params.length})`
  }
  if (filters?.search) {
    params.push(`%${filters.search}%`)
    where += ` AND (name ILIKE $${params.length} OR material ILIKE $${params.length} OR blurb ILIKE $${params.length})`
  }
  let order = ' ORDER BY popularity DESC'
  if (filters?.sort === 'price-asc') order = ' ORDER BY price ASC'
  if (filters?.sort === 'price-desc') order = ' ORDER BY price DESC'
  if (filters?.sort === 'name') order = ' ORDER BY name ASC'
  return query<FurnitureRow>('SELECT * FROM furniture' + where + order, params)
}

export async function getFurnitureByIds(ids: string[]): Promise<FurnitureRow[]> {
  if (!ids.length) return []
  return query<FurnitureRow>('SELECT * FROM furniture WHERE id = ANY($1::text[])', [ids])
}

export async function getProfile(handle: string, viewerId?: string | null) {
  return one<
    UserRow & { follower_count: number; following_count: number; house_count: number; following: boolean }
  >(
    `SELECT u.*,
       (SELECT count(*)::int FROM follows f WHERE f.following_id = u.id) AS follower_count,
       (SELECT count(*)::int FROM follows f WHERE f.follower_id = u.id) AS following_count,
       (SELECT count(*)::int FROM houses h WHERE h.user_id = u.id AND (h.is_public OR h.user_id = $2)) AS house_count,
       EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = $2 AND f.following_id = u.id) AS following
     FROM users u WHERE u.handle = $1`,
    [handle, viewerId ?? ''],
  )
}

export async function getDesigners(limit = 4) {
  return query<UserRow & { house_count: number; follower_count: number }>(
    `SELECT u.*,
       (SELECT count(*)::int FROM houses h WHERE h.user_id = u.id AND h.is_public) AS house_count,
       (SELECT count(*)::int FROM follows f WHERE f.following_id = u.id) AS follower_count
     FROM users u WHERE u.is_designer = true ORDER BY follower_count DESC LIMIT $1`,
    [limit],
  )
}

export async function getCollectionsFor(userId: string, viewerId?: string | null) {
  return query<CollectionRow & { house_count: number; preview: string | null }>(
    `SELECT c.*,
       (SELECT count(*)::int FROM collection_houses ch WHERE ch.collection_id = c.id) AS house_count,
       (SELECT h.cover_image FROM collection_houses ch JOIN houses h ON h.id = ch.house_id
         WHERE ch.collection_id = c.id LIMIT 1) AS preview
     FROM collections c
     WHERE c.user_id = $1 OR (c.is_public AND $2 = '')
     ORDER BY c.created_at DESC`,
    [userId, viewerId ?? ''],
  )
}

export async function listPublicCollections(limit = 6) {
  return query<CollectionRow & { house_count: number; preview: string | null; author_name: string; author_handle: string }>(
    `SELECT c.*,
       u.name AS author_name, u.handle AS author_handle,
       (SELECT count(*)::int FROM collection_houses ch WHERE ch.collection_id = c.id) AS house_count,
       (SELECT h.cover_image FROM collection_houses ch JOIN houses h ON h.id = ch.house_id
         WHERE ch.collection_id = c.id LIMIT 1) AS preview
     FROM collections c JOIN users u ON u.id = c.user_id
     WHERE c.is_public = true
     ORDER BY house_count DESC, c.created_at DESC LIMIT $1`,
    [limit],
  )
}

export async function getCollection(id: string, viewerId?: string | null) {
  const collection = await one<CollectionRow & { author_name: string; author_handle: string }>(
    `SELECT c.*, u.name AS author_name, u.handle AS author_handle
     FROM collections c JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
    [id],
  )
  if (!collection) return null
  if (!collection.is_public && collection.user_id !== viewerId) return null
  const houses = await query<HouseCardData>(
    `${CARD_SELECT} JOIN collection_houses ch ON ch.house_id = h.id WHERE ch.collection_id = $2 AND (h.is_public OR h.user_id = $1) ORDER BY ch.added_at DESC`,
    [viewerId ?? '', id],
  )
  return { collection, houses }
}

export async function listMoodboards(viewerId?: string | null) {
  return query<MoodboardRow & { author_name: string; author_handle: string; piece_count: number; preview: string | null }>(
    `SELECT m.*, u.name AS author_name, u.handle AS author_handle,
       (SELECT count(*)::int FROM moodboard_items mi WHERE mi.moodboard_id = m.id) AS piece_count,
       (SELECT COALESCE(mi.image, mi.color) FROM moodboard_items mi WHERE mi.moodboard_id = m.id AND (mi.image IS NOT NULL OR mi.color IS NOT NULL) ORDER BY mi.sort LIMIT 1) AS preview
     FROM moodboards m JOIN users u ON u.id = m.user_id
     WHERE m.is_public = true OR m.user_id = $1
     ORDER BY m.created_at DESC LIMIT 40`,
    [viewerId ?? ''],
  )
}

export async function getMoodboard(id: string, viewerId?: string | null) {
  const board = await one<MoodboardRow & { author_name: string; author_handle: string; author_hue: number }>(
    `SELECT m.*, u.name AS author_name, u.handle AS author_handle, u.avatar_hue AS author_hue
     FROM moodboards m JOIN users u ON u.id = m.user_id WHERE m.id = $1`,
    [id],
  )
  if (!board) return null
  if (!board.is_public && board.user_id !== viewerId) return null
  const items = await query<MoodboardItemRow>(
    'SELECT * FROM moodboard_items WHERE moodboard_id = $1 ORDER BY sort ASC, id ASC',
    [id],
  )
  const furnitureIds = items.filter((i) => i.kind === 'furniture' && i.ref_id).map((i) => i.ref_id as string)
  const furniture = await getFurnitureByIds(furnitureIds)
  return { board, items, furniture }
}

export async function getStats() {
  const [houses, rooms, pieces, designers] = await Promise.all([
    one<{ c: number }>('SELECT count(*)::int AS c FROM houses WHERE is_public = true'),
    one<{ c: number }>('SELECT count(*)::int AS c FROM rooms'),
    one<{ c: number }>('SELECT count(*)::int AS c FROM furniture'),
    one<{ c: number }>('SELECT count(*)::int AS c FROM users WHERE is_designer = true'),
  ])
  return {
    houses: houses?.c ?? 0,
    rooms: rooms?.c ?? 0,
    pieces: pieces?.c ?? 0,
    designers: designers?.c ?? 0,
  }
}

export async function getHouseTotals(houseId: string) {
  const row = await one<{ total: number; per_room: string }>(
    `SELECT COALESCE(SUM((it->>'price')::int), 0)::int AS total
     FROM rooms r JOIN layouts l ON l.id = r.active_layout_id
     CROSS JOIN LATERAL jsonb_array_elements(l.items) it
     WHERE r.house_id = $1`,
    [houseId],
  )
  return row?.total ?? 0
}

export async function getSavedCount(userId: string) {
  const row = await one<{ c: number }>('SELECT count(*)::int AS c FROM saves WHERE user_id = $1', [userId])
  return row?.c ?? 0
}
