-- ================================================
-- CITgive — Schéma base de données Supabase
-- Colle ce SQL dans l'éditeur SQL de Supabase
-- ================================================

-- Table des éditions (chaque giveaway)
CREATE TABLE editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL DEFAULT '',
  title_es VARCHAR(255) NOT NULL DEFAULT '',
  prize_name VARCHAR(255) NOT NULL,
  prize_image_url TEXT,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_drawn BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des inscriptions
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  roblox_username VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(edition_id, email),
  UNIQUE(edition_id, roblox_username)
);

-- Table des gagnants
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES editions(id),
  entry_id UUID NOT NULL REFERENCES entries(id),
  drawn_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_entries_edition ON entries(edition_id);
CREATE INDEX idx_entries_email ON entries(email);
CREATE INDEX idx_winners_edition ON winners(edition_id);
CREATE INDEX idx_editions_active ON editions(is_active, is_drawn);

-- ================================================
-- Row Level Security (RLS) — IMPORTANT
-- ================================================

ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Lecture publique des éditions actives
CREATE POLICY "Public can read active editions"
  ON editions FOR SELECT
  USING (is_active = true);

-- Lecture publique des gagnants
CREATE POLICY "Public can read winners"
  ON winners FOR SELECT
  USING (true);

-- Lecture publique des entrées (pour le compteur temps réel)
CREATE POLICY "Public can read entries count"
  ON entries FOR SELECT
  USING (true);

-- Service role a tous les droits (utilisé côté serveur)
-- Le service role key bypass RLS automatiquement
