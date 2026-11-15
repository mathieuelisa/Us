-- Droit premium par foyer (Lot 4 du plan Supabase, décision D1 : un achat
-- débloque les deux parents). Premier fournisseur branché : Stripe, en mode
-- test (demande explicite du 2026-11-15, deux parcours à comparer :
-- Checkout sur le web et PaymentSheet dans l'app).
--
-- Écriture réservée au serveur : seule l'Edge Function `stripe-webhook`
-- (clé service_role) crée une ligne, après un paiement confirmé par Stripe.
-- L'app ne fait que lire.
--
-- RLS revue explicitement :
--   - lecture : membres du foyer seulement (les deux parents voient le même
--     droit) ;
--   - aucune policy d'écriture, aucun grant d'écriture à `authenticated` ;
--   - aucun accès `anon`.
--
-- `has_premium()` est créée ici mais **pas encore ajoutée** aux policies des
-- tables premium (`baby_entries`, `name_swipes`…) : c'est la dette n°53, à
-- trancher séparément.

create table public.household_entitlements (
  household_id uuid primary key
    references public.households (id) on delete cascade,
  product text not null default 'premium_lifetime'
    check (product in ('premium_lifetime')),
  source text not null check (source in ('stripe', 'revenuecat', 'promo')),
  -- Identifiant du paiement chez le fournisseur (PaymentIntent Stripe) :
  -- retrouve l'achat en cas de remboursement ou de litige.
  provider_ref text unique,
  -- `false` pour un paiement en mode test Stripe : un droit obtenu avec une
  -- carte de test ne doit jamais compter en production.
  livemode boolean not null default false,
  purchased_at timestamptz not null default now(),
  -- Achat unique : `null` = à vie.
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.household_entitlements enable row level security;

create policy household_entitlements_select_members
  on public.household_entitlements for select
  to authenticated
  using (public.is_household_member(household_id));

revoke all on public.household_entitlements from anon, authenticated;
grant select on public.household_entitlements to authenticated;
grant all on public.household_entitlements to service_role;

-- Utilisée par les policies des tables premium (à brancher, dette n°53).
-- `security definer` pour lire la table sans dépendre de la RLS de
-- l'appelant ; elle ne renvoie qu'un booléen et vérifie l'appartenance au
-- foyer, donc personne ne peut sonder le statut d'un autre foyer.
create function public.has_premium(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_household_member(p_household_id)
    and exists (
      select 1
      from public.household_entitlements e
      where e.household_id = p_household_id
        and (e.expires_at is null or e.expires_at > now())
    );
$$;

revoke execute on function public.has_premium(uuid) from public, anon;
grant execute on function public.has_premium(uuid) to authenticated;
