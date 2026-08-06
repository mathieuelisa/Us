import type { Session } from '@supabase/supabase-js';
import { atom } from 'jotai';

/** Current Supabase auth session. Populated by the root layout via onAuthStateChange. */
export const sessionAtom = atom<Session | null>(null);
