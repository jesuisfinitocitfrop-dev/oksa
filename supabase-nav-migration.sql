-- ================================================
-- CITgive — Migration visibilité des onglets (navbar)
-- Colle ce SQL dans l'éditeur SQL de Supabase
-- ================================================

-- Visibilité des onglets du site (une seule ligne, id = 1)
-- Par défaut : seuls Accueil et Color Dice sont visibles,
-- les autres onglets sont « en veille » (masqués)
CREATE TABLE IF NOT EXISTS nav_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  visible_tabs JSONB NOT NULL DEFAULT '{"home":true,"winners":false,"shop":false,"supporters":false,"dice":true,"premium":true}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO nav_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS : pas de lecture publique directe, la navbar passe par l'API serveur
ALTER TABLE nav_settings ENABLE ROW LEVEL SECURITY;
