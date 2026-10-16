import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true, // la session reste ouverte, même hors connexion
      autoRefreshToken: true,
      detectSessionInUrl: true, // liens de confirmation / réinitialisation reçus par e-mail
    },
  }
);
