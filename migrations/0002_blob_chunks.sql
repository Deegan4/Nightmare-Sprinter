-- Fallback file storage for photos, manual pages and backups when no R2 bucket is bound.
-- Files are split into chunks (D1 limits a single value to 2 MB).
CREATE TABLE IF NOT EXISTS blob_chunks (
  key TEXT NOT NULL,
  idx INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (key, idx)
);
