# Comparatif solutions de paiement — CITgive

## Recommandation : **Stripe**

---

## Tableau comparatif

| Solution | Frais cartes EU | Frais cartes non-EU | Frais fixes | Setup | Minimum versement | Apple/Google Pay | SEPA | Notes |
|----------|-----------------|---------------------|-------------|-------|-------------------|-----------------|------|-------|
| **Stripe** ⭐ | 1,5% | 3,25% | +0,25€/tx | Très simple | Aucun | ✅ | ✅ | API la plus complète, webhooks fiables |
| **PayPal** | 3,49% | 3,99% | +0,35€/tx | Simple | 1€ | ❌ | ❌ | Frais élevés, UX moins bonne |
| **Mollie** | 1,8% | 2,9% | +0,25€/tx | Simple | 25€/mois min | ✅ | ✅ | Bon alternatif EU, très utilisé en NL/BE |
| **Adyen** | ~0,3% + interchange | Variable | Variable | Complexe | Volume élevé | ✅ | ✅ | Pour grandes entreprises, pas adapté ici |
| **SumUp** | 1,69% | — | 0€ | Simple | Aucun | ✅ | ❌ | Surtout orienté point de vente |
| **Paddle** | 5% + 0,50€ | 5% + 0,50€ | — | Moyen | Aucun | ✅ | ❌ | Agit comme revendeur, gère TVA automatiquement |

---

## Pourquoi Stripe pour CITgive ?

1. **Frais compétitifs** : 1,5% + 0,25€ pour les cartes européennes = sur 5€ → 0,325€ de frais
2. **Setup ultra simple** : clé API + webhook, prêt en 30 minutes
3. **Webhooks fiables** : confirmation de paiement instantanée → ajout des chances immédiat
4. **Checkout hébergé** : Stripe gère la page de paiement, 0 problème de conformité PCI
5. **Apple Pay / Google Pay** : inclus automatiquement dans Stripe Checkout
6. **Dashboard clair** : voir tous les paiements, remboursements faciles
7. **Virements** : vers compte bancaire français tous les 2-7 jours

---

## Variables d'environnement à configurer (Vercel)

```bash
STRIPE_SECRET_KEY=sk_live_xxx          # Clé secrète Stripe (sk_test_xxx pour tests)
STRIPE_WEBHOOK_SECRET=whsec_xxx        # Secret du webhook Stripe
```

## Configuration webhook Stripe

Dans le Dashboard Stripe → Developers → Webhooks :
- Endpoint URL : `https://citgive.com/api/payment/webhook`
- Événement à écouter : `checkout.session.completed`

---

## Exemple de frais réels

| Montant payé | Frais Stripe | Tu reçois | Chances ajoutées |
|-------------|-------------|-----------|-----------------|
| 1€ | 0,27€ | 0,73€ | +100 |
| 5€ | 0,33€ | 4,67€ | +500 |
| 10€ | 0,40€ | 9,60€ | +1 000 |
| 20€ | 0,55€ | 19,45€ | +2 000 |

