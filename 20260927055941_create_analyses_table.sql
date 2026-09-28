/*
# Create analyses table

1. New Tables
- `analyses` — stores XAUUSD chart analysis runs.
  - `id` uuid primary key
  - `user_id` uuid, owner, defaults to auth.uid()
  - `instrument` text (e.g. XAUUSD), not null
  - `strategy` text (all | strategy1 | strategy2 | strategy3), not null
  - `signal` text (BUY | SELL | WAIT | NO_VALID_SETUP), nullable until analysis completes
  - `setup_status` text, nullable
  - `images` jsonb — array of uploaded screenshot metadata {label, slot, dataUrl}
  - `result` jsonb — full structured analysis output from the AI vision service
  - `created_at` timestamptz default now()
2. Security
- Enable RLS on `analyses`.
- Owner-scoped CRUD: authenticated users can only access their own rows.
3. Notes
- The `result` jsonb column holds the structured analysis (per-strategy + combined).
- The `images` jsonb column stores uploaded screenshot previews for history display.
- Owner column defaults to auth.uid() so inserts without user_id succeed.
*/

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument text NOT NULL,
  strategy text NOT NULL,
  signal text,
  setup_status text,
  images jsonb DEFAULT '[]'::jsonb,
  result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
CREATE POLICY "select_own_analyses" ON analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
CREATE POLICY "insert_own_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON analyses;
CREATE POLICY "update_own_analyses" ON analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON analyses;
CREATE POLICY "delete_own_analyses" ON analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(user_id, created_at DESC);