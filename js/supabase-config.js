js/supabase-config.js
// Configuración inicial de Supabase para BlueSphere
const SUPABASE_URL = "";         // Aquí irá tu URL de Supabase
const SUPABASE_KEY = "";         // Aquí irá tu API Key pública

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
