import { createClient } from '@supabase/supabase-js';
import supabaseConfig from '../../supabase-config.json';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
