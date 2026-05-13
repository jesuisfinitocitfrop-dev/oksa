-- ================================================
-- CITgive — Migration v2 : Bonus + Paiements
-- À coller dans l'éditeur SQL Supabase
-- ================================================

-- 1. Colonnes supplémentaires sur entries
ALTER TABLE entries ADD COLUMN IF NOT EXISTS chances INTEGER NOT NULL DEFAULT 2;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS referral_token VARCHAR(32) UNIQUE;

-- 2. Colonne total_chances sur winners (pour affichage)
ALTER TABLE winners ADD COLUMN IF NOT EXISTS total_chances INTEGER DEFAULT 1;

-- 3. Actions bonus (configurables par édition)
CREATE TABLE IF NOT EXISTS bonus_actions (
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

-- 4. Complétion des actions bonus
CREATE TABLE IF NOT EXISTS bonus_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  bonus_action_id UUID NOT NULL REFERENCES bonus_actions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, bonus_action_id)
);

-- 5. Paiements Stripe
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  edition_id UUID NOT NULL REFERENCES editions(id),
  amount_eur INTEGER NOT NULL,
  chances_added INTEGER NOT NULL,
  stripe_payment_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bonus_actions_edition ON bonus_actions(edition_id);
CREATE INDEX IF NOT EXISTS idx_bonus_completions_entry ON bonus_completions(entry_id);
CREATE INDEX IF NOT EXISTS idx_payments_entry ON payments(entry_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_entries_referral ON entries(referral_token);

-- ================================================
-- RLS pour les nouvelles tables
-- ================================================

ALTER TABLE bonus_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active bonus actions"
  ON bonus_actions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read completions"
  ON bonus_completions FOR SELECT
  USING (true);

-- Les paiements et completions sont gérés côté serveur (service role bypass RLS)

-- ================================================
-- Migration v3 : CPAGrip Postback + Booster
-- ================================================

-- 1. Colonne CPAGrip sur entries
ALTER TABLE entries ADD COLUMN IF NOT EXISTS chances_from_cpagrip INTEGER NOT NULL DEFAULT 0;

-- 2. Completions CPAGrip (une ligne par offre complétée par entry)
CREATE TABLE IF NOT EXISTS cpagrip_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  payout_usd NUMERIC(10,4) NOT NULL,
  chances_credited INTEGER NOT NULL,
  tracking_id_received TEXT,
  raw_postback JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, offer_id)
);

-- 3. Log audit de tous les postbacks reçus
CREATE TABLE IF NOT EXISTS cpagrip_postback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_body TEXT,
  password_valid BOOLEAN NOT NULL DEFAULT false,
  outcome TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  ip_address TEXT
);

-- 4. Table de cooldown (suivi des démarrages offer wall)
CREATE TABLE IF NOT EXISTS cpagrip_starts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_cpagrip_completions_entry ON cpagrip_completions(entry_id);
CREATE INDEX IF NOT EXISTS idx_cpagrip_completions_offer ON cpagrip_completions(offer_id);
CREATE INDEX IF NOT EXISTS idx_cpagrip_starts_entry ON cpagrip_starts(entry_id);
CREATE INDEX IF NOT EXISTS idx_cpagrip_postback_log_received ON cpagrip_postback_log(received_at);

-- RLS : aucun accès public, tout passe par service_role
ALTER TABLE cpagrip_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpagrip_postback_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpagrip_starts ENABLE ROW LEVEL SECURITY;
