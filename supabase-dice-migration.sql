-- ================================================
-- CITgive — Migration Color Dice
-- Colle ce SQL dans l'éditeur SQL de Supabase
-- ================================================

-- Config du Color Dice (une seule ligne, id = 1)
CREATE TABLE IF NOT EXISTS dice_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- Couleurs autorisées au tirage aléatoire
  enabled_colors JSONB NOT NULL DEFAULT '["red","orange","yellow","green","blue","purple"]',
  -- Couleur forcée par dé (index 0 = dé 1, ... index 5 = dé 6). null = aléatoire
  forced_colors JSONB NOT NULL DEFAULT '[null,null,null,null,null,null]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO dice_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS : aucune lecture publique (la config est secrète, les lancers passent
-- par l'API serveur avec la service role key qui bypass le RLS)
ALTER TABLE dice_config ENABLE ROW LEVEL SECURITY;
