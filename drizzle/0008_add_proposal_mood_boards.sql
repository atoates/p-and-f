-- Visual inspiration images attached to a proposal. The florist
-- uploads these into the proposal editor; the bride sees them on the
-- public /p/[token] page. Bytes live in Cloudflare R2; this row only
-- stores the public URL + ordering metadata.

CREATE TABLE IF NOT EXISTS proposal_mood_board_images (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Everything queries these by proposal, ordered by position. Single
-- composite index covers both the list and the ordered render.
CREATE INDEX IF NOT EXISTS idx_proposal_mood_board_proposal_position
  ON proposal_mood_board_images (proposal_id, position);
