-- ============================================================
-- VIRAL POLLS — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- POLLS TABLE
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  template TEXT DEFAULT 'standard',
  theme TEXT DEFAULT 'gradient-purple',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  total_votes INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  creator_id TEXT,
  settings JSONB DEFAULT '{}'
);

-- VOTES TABLE
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voter_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Prevent duplicate votes from same fingerprint
CREATE UNIQUE INDEX IF NOT EXISTS unique_vote ON votes(poll_id, voter_fingerprint);

-- Auto-increment total_votes on new vote
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE polls SET total_votes = total_votes + 1 WHERE id = NEW.poll_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_vote ON votes;
CREATE TRIGGER on_new_vote
  AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- Function to get vote results per option for a poll
CREATE OR REPLACE FUNCTION get_poll_results(poll_slug TEXT)
RETURNS TABLE(option_index INT, vote_count BIGINT) AS $$
BEGIN
  RETURN QUERY
    SELECT v.option_index, COUNT(*) as vote_count
    FROM votes v
    JOIN polls p ON p.id = v.poll_id
    WHERE p.slug = poll_slug
    GROUP BY v.option_index;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies: open read/write for anonymous users
CREATE POLICY "Anyone can read polls"   ON polls FOR SELECT USING (true);
CREATE POLICY "Anyone can create polls" ON polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update polls" ON polls FOR UPDATE USING (true);
CREATE POLICY "Anyone can vote"         ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read votes"   ON votes FOR SELECT USING (true);

-- Enable Realtime for live vote updates
ALTER TABLE polls REPLICA IDENTITY FULL;
ALTER TABLE votes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
-- (If this errors, go to Supabase Dashboard → Realtime → enable for both tables)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE polls;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE votes;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
