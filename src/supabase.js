import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// On vérifie si la valeur est absente ou si c'est un placeholder "..."
const isInvalid = (val) => !val || val === '...' || val.includes('votre_');

const supabaseUrl = isInvalid(rawUrl) ? 'https://xyz.supabase.co' : rawUrl;
const supabaseAnonKey = isInvalid(rawKey) ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' : rawKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
