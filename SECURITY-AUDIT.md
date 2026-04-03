# BetLoL — Security Audit V1

Date: 2025-04-03

## Vérifié et validé

### 1. Secrets
- **SUPABASE_SERVICE_ROLE_KEY** : utilisé uniquement dans `lib/supabase/admin.ts` (server-only)
- **STRIPE_SECRET_KEY** : utilisé uniquement dans `lib/stripe/index.ts` (server-only, lazy init)
- **PANDASCORE_API_KEY** : utilisé uniquement dans `lib/pandascore/index.ts` (server-only)
- Aucun secret n'est importé dans un fichier `"use client"` ou un composant client
- Le fichier `lib/supabase/client.ts` utilise uniquement `NEXT_PUBLIC_*` (clés publiques)

### 2. Validation des inputs
Toutes les Server Actions valident avec Zod **avant** tout traitement :
- `placeBet` → `placeBetSchema`
- `simulateDeposit` → `depositSchema`
- `simulateWithdrawal` → `withdrawalSchema`
- `createMatch` → `createMatchSchema`
- `updateMatch` → `updateMatchSchema`
- `upsertOdd` → `upsertOddSchema`
- `settleMatch` → `settleMatchSchema`
- `cancelMatch` → `cancelMatchSchema`

### 3. RLS (Row Level Security)
Toutes les tables ont RLS activé :
- `profiles` : un user ne lit/modifie que son propre profil
- `bets` : un user ne voit que ses propres paris
- `transactions` : un user ne voit que ses propres transactions
- `lol_matches` / `odds` : lecture publique, écriture admin uniquement
- Les admins peuvent lire toutes les tables via des policies dédiées

### 4. Protection contre les doubles soumissions
- Le composant `Button` a `disabled={disabled || loading}` : auto-disabled pendant le loading
- Testé sur : BetSlip, WalletModal, admin forms

### 5. Match fermé
- La RPC `place_bet` vérifie `match.status IN ('upcoming', 'live')` côté SQL avec `FOR UPDATE`
- La RPC vérifie aussi `odd.is_active = true` avec `FOR UPDATE`
- Impossible de contourner via Postman — la vérification est dans la fonction SQL

### 6. Rate limiting
- `placeBet` : max 10 appels/minute/user (Map in-memory)
- PandaScore API : respect des headers `X-Rate-Limit` avec attente automatique

### 7. Opérations atomiques
- `place_bet` : transaction atomique (lock odd → lock match → lock profile → debit → insert bet → insert tx)
- `settle_match` : transaction atomique (lock match → loop bets → credit winners → insert tx)
- `cancel_match` : transaction atomique (lock match → loop bets → refund → insert tx)
- `simulate_deposit` / `simulate_withdrawal` : atomiques via RPC avec `FOR UPDATE`

### 8. Authentification
- Proxy (middleware) protège `/mes-paris`, `/portefeuille` (auth required)
- Proxy protège `/admin/*` (auth + role='admin')
- Chaque Server Action admin re-vérifie le rôle via `requireAdmin()`
- OAuth Google + email/password via Supabase Auth
- Auto-création de profil via trigger `handle_new_user`

## Corrigé lors de l'audit

| Issue | Correction |
|-------|-----------|
| Wallet race condition (non-atomic read-update) | Remplacé par RPC `simulate_deposit` / `simulate_withdrawal` avec `FOR UPDATE` |
| Admin actions sans validation Zod | Ajouté `createMatchSchema`, `updateMatchSchema`, `upsertOddSchema`, `settleMatchSchema`, `cancelMatchSchema` |
| Pas de rate limiting sur `placeBet` | Ajouté rate limiter in-memory (10/min/user) |

## Reste à faire avant production

### Critique
- [ ] **Stripe Checkout** : remplacer les simulations dépôt/retrait par de vrais paiements Stripe
- [ ] **KYC** : implémenter la vérification d'identité (`kyc_status` existe dans le schéma mais n'est pas vérifié pour les retraits)
- [ ] **Rate limiter persistant** : remplacer le Map in-memory par Redis ou une solution edge-compatible
- [ ] **HTTPS** : forcer HTTPS en production
- [ ] **CSP headers** : ajouter Content-Security-Policy

### Important
- [ ] **RGPD** : politique de confidentialité, droit à l'effacement, export des données
- [ ] **Mentions légales** : conditions d'utilisation, limites de responsabilité
- [ ] **Jeu responsable** : limites de dépôt auto-configurables, auto-exclusion
- [ ] **Logs** : audit trail complet pour les opérations financières (pas seulement les transactions)
- [ ] **Monitoring** : alertes sur les volumes anormaux, les erreurs de paiement

### Nice to have
- [ ] **2FA** : authentification à deux facteurs pour les comptes admin
- [ ] **IP blocking** : détection d'accès depuis des pays interdits
- [ ] **Odds manipulation** : détection de patterns de paris suspects
- [ ] **WAF** : Web Application Firewall
