import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("As credenciais do Supabase não foram definidas no .env");
}

export const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
