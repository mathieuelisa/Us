import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/lib/supabase/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Don't throw here: importing this module must stay side-effect-safe so the
  // rest of the app can render. Only actual Supabase calls will fail until
  // .env is filled in (copy .env.example).
  console.warn(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY. Copy .env.example to .env and fill in your Supabase project values — auth/data calls will fail until then.',
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Handled manually in the root layout instead: Expo Router's web
      // linking strips the URL hash before GoTrueClient's own async
      // detection gets a chance to read it, so the built-in flag is
      // unreliable here. See restoreSessionFromUrl() in _layout.tsx.
      detectSessionInUrl: false,
    },
  },
);
