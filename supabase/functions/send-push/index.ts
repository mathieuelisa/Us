// Envoi d'une notification push mise en file par la base
// (`notification_outbox`, migration `push_notifications`). Appelée par
// `enqueue_partner_notification` via pg_net, avec le seul identifiant de la
// ligne à envoyer.
//
// Déployée avec `verify_jwt = false` : pg_net n'a pas de jeton utilisateur.
// Sans risque : la fonction n'envoie que ce qui est déjà en file et pas
// encore parti (« réservation » atomique sur `sent_at`), et les identifiants
// sont des UUID impossibles à deviner. Un appel en double n'envoie rien.
//
// Chaîne : Supabase → service push d'Expo → Firebase (Android). Les tokens
// refusés par Expo (« DeviceNotRegistered » : app désinstallée…) sont
// supprimés.

import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type OutboxRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
};

type ExpoTicket =
  | { status: 'ok'; id: string }
  | { status: 'error'; message: string; details?: { error?: string } };

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const payload = await req.json().catch(() => null);
  const id = payload?.id;
  if (typeof id !== 'string') return json({ error: 'missing_id' }, 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Réservation : seule la première requête pour cette ligne passe.
  const { data: row, error: claimError } = await supabase
    .from('notification_outbox')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', id)
    .is('sent_at', null)
    .select('id, user_id, title, body, data')
    .maybeSingle<OutboxRow>();

  if (claimError) return json({ error: 'claim_failed' }, 500);
  if (!row) return json({ status: 'nothing_to_send' });

  const { data: tokens, error: tokensError } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', row.user_id);

  if (tokensError || !tokens?.length) {
    await supabase
      .from('notification_outbox')
      .update({ error: tokensError ? 'tokens_failed' : 'no_token' })
      .eq('id', row.id);
    return json({ status: 'no_token' });
  }

  const messages = tokens.map(({ token }) => ({
    to: token,
    title: row.title,
    body: row.body,
    data: row.data,
    sound: 'default',
    // Canal Android créé par l'app (« Votre partenaire »).
    channelId: 'partner',
    priority: 'high',
  }));

  let tickets: ExpoTicket[] = [];
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
    const result = await response.json();
    tickets = Array.isArray(result?.data) ? result.data : [];
    if (!response.ok) {
      await supabase
        .from('notification_outbox')
        .update({ error: `expo_http_${response.status}` })
        .eq('id', row.id);
      return json({ status: 'expo_error' }, 502);
    }
  } catch {
    await supabase
      .from('notification_outbox')
      .update({ error: 'expo_unreachable' })
      .eq('id', row.id);
    return json({ status: 'expo_unreachable' }, 502);
  }

  const invalidTokens: string[] = [];
  const errors: string[] = [];
  tickets.forEach((ticket, index) => {
    if (ticket.status !== 'error') return;
    const code = ticket.details?.error ?? 'unknown';
    errors.push(code);
    if (code === 'DeviceNotRegistered') invalidTokens.push(messages[index].to);
  });

  if (invalidTokens.length) {
    await supabase.from('push_tokens').delete().in('token', invalidTokens);
  }
  if (errors.length) {
    await supabase
      .from('notification_outbox')
      .update({ error: errors.join(',') })
      .eq('id', row.id);
  }

  return json({
    status: 'sent',
    devices: messages.length,
    errors: errors.length,
  });
});
