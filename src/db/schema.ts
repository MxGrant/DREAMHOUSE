/**
 * Cloudflare D1 (SQLite) schema. Applied idempotently on first use.
 * Timestamps are stored as ISO-8601 text so they sort lexicographically.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  avatar_hue INTEGER NOT NULL DEFAULT 330,
  is_designer INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS houses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '/homes/living-linen.jpg',
  style TEXT NOT NULL DEFAULT 'scandinavian',
  theme TEXT NOT NULL DEFAULT 'blush',
  budget INTEGER NOT NULL DEFAULT 8000,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  house_id TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'living',
  width_cm INTEGER NOT NULL DEFAULT 440,
  length_cm INTEGER NOT NULL DEFAULT 520,
  wall_color TEXT NOT NULL DEFAULT '#FFF1F4',
  floor_type TEXT NOT NULL DEFAULT 'oak',
  floor_color TEXT NOT NULL DEFAULT '#E3C3A1',
  theme TEXT NOT NULL DEFAULT 'blush',
  sort INTEGER NOT NULL DEFAULT 0,
  active_layout_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS furniture (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  style TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color TEXT NOT NULL,
  price INTEGER NOT NULL,
  width INTEGER NOT NULL,
  depth INTEGER NOT NULL,
  height INTEGER NOT NULL,
  material TEXT NOT NULL DEFAULT '',
  blurb TEXT NOT NULL DEFAULT '',
  popularity INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS layouts (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Layout',
  items TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS likes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  house_id TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, house_id)
);

CREATE TABLE IF NOT EXISTS saves (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  house_id TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, house_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  house_id TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS collection_houses (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  house_id TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (collection_id, house_id)
);

CREATE TABLE IF NOT EXISTS moodboards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'blush',
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS moodboard_items (
  id TEXT PRIMARY KEY,
  moodboard_id TEXT NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  ref_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  color TEXT,
  image TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS houses_user_idx ON houses(user_id);
CREATE INDEX IF NOT EXISTS rooms_house_idx ON rooms(house_id);
CREATE INDEX IF NOT EXISTS layouts_room_idx ON layouts(room_id);
CREATE INDEX IF NOT EXISTS comments_house_idx ON comments(house_id);
CREATE INDEX IF NOT EXISTS moodboard_items_board_idx ON moodboard_items(moodboard_id);
CREATE INDEX IF NOT EXISTS furniture_category_idx ON furniture(category);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
`
