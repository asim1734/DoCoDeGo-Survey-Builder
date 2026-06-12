-- Migration: Add name column to users table
-- Run this if your local database was created before the name column was added to the schema
-- Command: wrangler d1 execute <DB_NAME> --local --file=./api/src/db/migrations/0001_add_name_to_users.sql

ALTER TABLE users ADD COLUMN name TEXT;
