import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env'), override: true })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
	throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en server/.env')
}

// Cliente con permisos de service_role para operaciones de DB/RPC. No debe usarse para métodos supabase.auth,
// ya que auth.getUser() sobreescribe internamente las credenciales del cliente compartido con el JWT del usuario.
export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: { persistSession: false, autoRefreshToken: false }
})

// Cliente dedicado exclusivamente a verificar tokens de usuario (supabase.auth.getUser).
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey || supabaseKey, {
	auth: { persistSession: false, autoRefreshToken: false }
})