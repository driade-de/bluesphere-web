// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://ophicpcbgdgzthjamzoz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waGljcGNiZ2RnenRoamFtem96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjgwMzUsImV4cCI6MjA4MDMwNDAzNX0.K55Tk-cdbAFDOtGrIMN7vYFaJAccrsD6UdOrARt1P5c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

