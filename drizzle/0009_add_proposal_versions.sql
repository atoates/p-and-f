-- Point-in-time snapshots of a proposal's order, line items, and
-- mood board. Each send of a proposal pins a new version so the
-- florist can show the bride "this is what changed between v2 and
-- v3" without having to keep separate PDFs.
--
-- snapshot_json is intentionally denormalised -- it's the frozen
-- payload as it existed when the version was created, independent of
-- any later edits to order_items, proposal_mood_board_images, etc.

CREATE TABLE IF NOT EXISTS proposal_versions (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_json JSONB NOT NULL,
  change_summary TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (proposal_id, version_number)
);

-- Reverse-chrono listing by proposal is the primary query pattern
-- (timeline view); an index on (proposal_id, version_number DESC)
-- covers both the list and the "get version N" lookup.
CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal_version
  ON proposal_versions (proposal_id, version_number DESC);
