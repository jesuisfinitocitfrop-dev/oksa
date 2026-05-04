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
  chances INTEGER NOT NULL DEFAULT 2,
  referral_token VARCHAR(32) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(edition_id, email),
  UNIQUE(edition_id, roblox_username)
);

-- Table des gagnants
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES editions(id),
  entry_id UUID NOT NULL REFERENCES entries(id),
  total_chances INTEGER DEFAULT 1,
  drawn_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actions bonus par édition
CREATE TABLE bonus_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES editions(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(10) DEFAULT '🎯',
  url TEXT,
  bonus_chances INTEGER NOT NULL DEFAULT 5,
  action_type VARCHAR(50) NOT NULL DEFAULT 'custom',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complétion des actions bonus
CREATE TABLE bonus_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  bonus_action_id UUID NOT NULL REFERENCES bonus_actions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, bonus_action_id)
);

-- Paiements Stripe
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  edition_id UUID NOT NULL REFERENCES editions(id),
  amount_eur INTEGER NOT NULL,
  chances_added INTEGER NOT NULL,
  stripe_payment_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_entries_edition ON entries(edition_id);
CREATE INDEX idx_entries_email ON entries(email);
CREATE INDEX idx_winners_edition ON winners(edition_id);
CREATE INDEX idx_editions_active ON editions(is_active, is_drawn);
CREATE INDEX idx_bonus_actions_edition ON bonus_actions(edition_id);
CREATE INDEX idx_bonus_completions_entry ON bonus_completions(entry_id);
CREATE INDEX idx_payments_entry ON payments(entry_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_id);
CREATE INDEX idx_entries_referral ON entries(referral_token);

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

-- RLS nouvelles tables
ALTER TABLE bonus_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active bonus actions"
  ON bonus_actions FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read completions"
  ON bonus_completions FOR SELECT USING (true);

-- Service role a tous les droits (utilisé côté serveur)
-- Le service role key bypass RLS automatiquement
