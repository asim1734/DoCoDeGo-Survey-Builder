-- Migration: Add theme columns to surveys table
-- Run this if your local database was created before bg_color and font_family were added
-- Command: wrangler d1 execute <DB_NAME> --local --file=./api/src/db/migrations/0002_add_theme_columns.sql

ALTER TABLE surveys ADD COLUMN bg_color TEXT NOT NULL DEFAULT '#f9fafb';
ALTER TABLE surveys ADD COLUMN font_family TEXT NOT NULL DEFAULT 'Inter';
