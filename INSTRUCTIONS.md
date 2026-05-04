# CITgive — Instructions de mise en ligne

## Vue d'ensemble
Site Next.js complet avec :
- Landing page + formulaire tombola (FR/EN/ES)
- Panel admin (créer éditions, voir inscrits, lancer le tirage)
- Base de données Supabase
- Emails de confirmation via Resend
- Hébergement Vercel (gratuit)

---

## ÉTAPE 1 — Supabase (base de données)

1. Va sur https://supabase.com et connecte-toi
2. Crée un **New Project** (nom : `citgive`, choisis un mot de passe fort)
3. Attends 1-2 minutes que le projet se crée
4. Va dans **SQL Editor** (menu gauche)
5. Colle le contenu du fichier `supabase-schema.sql` et clique **Run**
6. Va dans **Project Settings → API**
7. Note les valeurs suivantes (tu en auras besoin à l'étape 3) :
   - `Project URL` → c'est ton `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → c'est ton `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → c'est ton `SUPABASE_SERVICE_ROLE_KEY`

---

## ÉTAPE 2 — Resend (emails)

1. Va sur https://resend.com et crée un compte gratuit
2. Va dans **API Keys** → **Create API Key**
3. Note la clé → c'est ton `RESEND_API_KEY`
4. Pour l'email d'envoi :
   - **Sans domaine** : utilise `onboarding@resend.dev` comme `RESEND_FROM_EMAIL` (limité)
   - **Avec domaine** (recommandé) : va dans **Domains** → ajoute `citgive.com` → suis les instructions DNS

---

## ÉTAPE 3 — Variables d'environnement (Vercel)

1. Va sur https://vercel.com et connecte-toi
2. Clique **Add New → Project**
3. Importe ce dossier (ou connecte ton GitHub)
4. Avant de déployer, va dans **Environment Variables** et ajoute :

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJxxx...
SUPABASE_SERVICE_ROLE_KEY         = eyJxxx...
RESEND_API_KEY                    = re_xxxxx
RESEND_FROM_EMAIL                 = noreply@citgive.com
ADMIN_PASSWORD                    = (choisis un mot de passe fort)
IRON_SESSION_SECRET               = (génère 32 caractères aléatoires, ex: abc123xyz...)
NEXT_PUBLIC_APP_URL               = https://citgive.com
```

5. Clique **Deploy**

---

## ÉTAPE 4 — Nom de domaine (CITgive.com)

1. Achète `CITgive.com` sur OVH, Namecheap, ou Porkbun
2. Dans Vercel → ton projet → **Settings → Domains**
3. Ajoute `citgive.com`
4. Vercel te donne des enregistrements DNS à configurer chez ton registrar
5. Attends 5-30 minutes que ça se propage

---

## ÉTAPE 5 — Développement local (optionnel)

```bash
# Dans le dossier du projet
npm install

# Copie le fichier d'exemple
cp .env.local.example .env.local
# Remplis les valeurs dans .env.local

# Lance le serveur
npm run dev
# → Site accessible sur http://localhost:3000
```

---

## UTILISATION — Créer un giveaway

1. Va sur `https://citgive.com/fr/admin/login`
2. Connecte-toi avec ton mot de passe admin
3. Clique **Créer une édition** et remplis :
   - Titre en FR/EN/ES (ex: "Dragon Doré #1")
   - Nom du prix (ex: "Golden Dragon")
   - URL de l'image du dragon (upload sur Supabase Storage ou Imgur)
   - Date de fin des inscriptions
   - Date du tirage
4. Clique **Créer l'édition** → le giveaway apparaît immédiatement sur le site

---

## UTILISATION — Lancer le tirage

1. Admin → **Lancer le tirage**
2. Vérifie que tu as des participants
3. Clique **LANCER LE TIRAGE** → confirme
4. Animation slot machine → révèle le gagnant avec confettis
5. Le gagnant est enregistré en base et visible sur `/winners`

---

## UTILISATION — Exporter les participants

1. Admin → **Voir les inscrits**
2. Clique **Exporter CSV**
3. Fichier téléchargé avec email + pseudo Roblox de tous les participants

---

## Image du dragon

Pour uploader l'image du dragon dans Supabase :
1. Supabase → **Storage** → **New Bucket** → nom : `prizes` → Public
2. Clique **Upload file** → sélectionne ton screenshot du dragon
3. Clique sur le fichier → **Get URL** → copie l'URL
4. Utilise cette URL dans le champ "URL de l'image du prix"

---

## Structure des URLs

```
citgive.com/          → Page principale (FR)
citgive.com/en/       → Page principale (EN)
citgive.com/es/       → Page principale (ES)
citgive.com/winners   → Gagnants
citgive.com/shop      → Boutique (placeholder)
citgive.com/fr/admin/login     → Connexion admin
citgive.com/fr/admin/dashboard → Dashboard admin
citgive.com/fr/admin/entries   → Liste participants
citgive.com/fr/admin/draw      → Lancer le tirage
```

---

## Coûts

| Service | Plan | Coût |
|---------|------|------|
| Vercel | Hobby | **Gratuit** |
| Supabase | Free | **Gratuit** (500MB, 50k rows) |
| Resend | Free | **Gratuit** (3000 emails/mois) |
| Domaine | - | ~10€/an |

**Total : ~10€/an** (juste le nom de domaine)
