/*
# Resume Intelligence Platform — Schema

1. New Tables
- `resumes` — stores user resumes with full structured data as JSONB
  - id, user_id, title, data (JSONB), ats_score, created_at, updated_at
- `resume_versions` — snapshot history for each resume
  - id, resume_id, version_number, data (JSONB), ats_score, created_at
- `resume_analyses` — multi-dimensional analysis results
  - id, resume_id, scores (JSONB), insights (JSONB), created_at
- `cover_letters` — generated cover letters
  - id, resume_id, company, position, content, created_at
- `job_matches` — job description match results
  - id, resume_id, job_description, match_score, matched_skills (JSONB), missing_skills (JSONB), created_at

2. Security
- RLS enabled on all tables
- Owner-scoped CRUD: authenticated users can only access their own rows
- user_id defaults to auth.uid() for seamless inserts
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Resume',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ats_score integer DEFAULT 0,
  template text DEFAULT 'professional',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ats_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  company text NOT NULL,
  position text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  job_description text NOT NULL,
  match_score integer DEFAULT 0,
  matched_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  strong_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  weak_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resumes" ON resumes;
CREATE POLICY "select_own_resumes" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_resumes" ON resumes;
CREATE POLICY "insert_own_resumes" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_resumes" ON resumes;
CREATE POLICY "update_own_resumes" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_resumes" ON resumes;
CREATE POLICY "delete_own_resumes" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_versions" ON resume_versions;
CREATE POLICY "select_own_versions" ON resume_versions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_versions" ON resume_versions;
CREATE POLICY "insert_own_versions" ON resume_versions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_versions" ON resume_versions;
CREATE POLICY "delete_own_versions" ON resume_versions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_analyses" ON resume_analyses;
CREATE POLICY "select_own_analyses" ON resume_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_analyses" ON resume_analyses;
CREATE POLICY "insert_own_analyses" ON resume_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_analyses" ON resume_analyses;
CREATE POLICY "delete_own_analyses" ON resume_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_cover_letters" ON cover_letters;
CREATE POLICY "select_own_cover_letters" ON cover_letters FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_cover_letters" ON cover_letters;
CREATE POLICY "insert_own_cover_letters" ON cover_letters FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_cover_letters" ON cover_letters;
CREATE POLICY "delete_own_cover_letters" ON cover_letters FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_job_matches" ON job_matches;
CREATE POLICY "select_own_job_matches" ON job_matches FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_job_matches" ON job_matches;
CREATE POLICY "insert_own_job_matches" ON job_matches FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_job_matches" ON job_matches;
CREATE POLICY "delete_own_job_matches" ON job_matches FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_resume_id ON resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches(user_id);