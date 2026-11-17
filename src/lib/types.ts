export type UserRow = {
  id: string
  name: string
  email: string
  handle: string
  bio: string
  location: string
  avatar_hue: number
  is_designer: boolean
  created_at: string
}

export type HouseRow = {
  id: string
  user_id: string
  name: string
  description: string
  cover_image: string
  style: string
  theme: string
  budget: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export type RoomRow = {
  id: string
  house_id: string
  name: string
  type: string
  width_cm: number
  length_cm: number
  wall_color: string
  floor_type: string
  floor_color: string
  theme: string
  sort: number
  active_layout_id: string | null
  created_at: string
  updated_at: string
}

export type FurnitureRow = {
  id: string
  name: string
  category: string
  style: string
  color_name: string
  color: string
  price: number
  width: number
  depth: number
  height: number
  material: string
  blurb: string
  popularity: number
}

export type LayoutItem = {
  id: string
  furnitureId: string
  name: string
  category: string
  x: number
  y: number
  w: number
  d: number
  h: number
  rotation: number
  color: string
  price: number
}

export type LayoutRow = {
  id: string
  room_id: string
  name: string
  items: LayoutItem[]
  updated_at: string
}

export type MoodboardRow = {
  id: string
  user_id: string
  title: string
  description: string
  theme: string
  is_public: boolean
  created_at: string
}

export type MoodboardItemRow = {
  id: string
  moodboard_id: string
  kind: 'furniture' | 'color' | 'image' | 'note'
  ref_id: string | null
  title: string
  body: string
  color: string | null
  image: string | null
  sort: number
}

export type CollectionRow = {
  id: string
  user_id: string
  title: string
  description: string
  is_public: boolean
  created_at: string
}

export type CommentRow = {
  id: string
  house_id: string
  user_id: string
  body: string
  created_at: string
}

export type HouseCardData = HouseRow & {
  author_name: string
  author_handle: string
  author_hue: number
  room_count: number
  like_count: number
  save_count: number
  liked: boolean
  saved: boolean
  room_types: string[]
}
