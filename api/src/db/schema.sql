CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  -- NOTE: The 'name' column was added after initial schema creation.
  -- If your local DB is missing this column, run the migration in api/src/db/migrations/0001_add_name_to_users.sql
  -- or drop and recreate your local database.
  name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Active login sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One-time passwords for email login
CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A survey created by a user
CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  brand_color TEXT DEFAULT '#4f46e5',
  bg_color TEXT DEFAULT '#ffffff',
  page_bg_color TEXT DEFAULT '#f8fafc',
  font_family TEXT DEFAULT 'Inter',
  logo_url TEXT DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A question belonging to a survey
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  options TEXT DEFAULT '[]',
  is_required INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- A single submission to a survey
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One answer within a response
CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value TEXT NOT NULL DEFAULT ''
);
