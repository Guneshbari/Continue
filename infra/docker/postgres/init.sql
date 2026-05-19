-- PostgreSQL init script
-- Runs once on container first start (empty volume)

CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- Full-text trigram search
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- Accent-insensitive search
