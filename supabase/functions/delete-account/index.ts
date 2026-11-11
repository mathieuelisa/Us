// Suppression du compte de l'utilisateur connecté (Réglages → « Supprimer mon
// compte »). Obligatoire pour la publication sur l'App Store.
//
// Supprimer un utilisateur d'Auth exige la clé `service_role`, qui ne doit
// jamais être dans l'app : d'où cette fonction serveur. Elle ne prend aucun
// paramètre — l'utilisateur supprimé est **toujours** celui du jeton reçu,
// impossible d'en viser un autre.
//
// Les données suivent par cascade (`profiles` → `auth.users`) :
//   - personne enceinte : `households.pregnant_user_id` est en cascade, donc
//     le foyer et **toutes** ses données partagées disparaissent, y compris
//     pour le co-parent ;
//   - co-parent : `households.partner_user_id` passe à `null` ; ses humeurs,
//     symptômes et rendez-vous disparaissent, le foyer reste à l'autre parent.
// L'écran de confirmation de l'app annonce cette différence.
//
// Déployée avec `verify_jwt = true` : la passerelle refuse déjà toute requête
// sans jeton valide.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  const authorization = req.headers.get('Authorization');
  if (!authorization) {
    return json({ error: 'not_authenticated' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'server_misconfigured' }, 500);
  }

  // Identifie l'appelant à partir de son propre jeton.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return json({ error: 'not_authenticated' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );
  if (deleteError) {
    return json({ error: 'delete_failed' }, 500);
  }

  return json({ deleted: true }, 200);
});
