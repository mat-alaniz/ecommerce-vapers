import { Router } from 'express'
import { supabase, supabaseAuth } from '../config/supabase.js'

const router = Router()

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body
    
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: full_name || email.split('@')[0], phone: phone || null },
        emailConfirm: false
      }
    })
    
    if (authError) throw authError
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name || email.split('@')[0],
        phone: phone || null,
        role: 'cliente',
        total_units_purchased: 0
      }])
    
    if (profileError) throw profileError
    
    res.json({ success: true, message: 'Usuario registrado exitosamente', user: authData.user })
  } catch (err) {
    console.error('❌ Error en registro:', err)
    res.status(400).json({ error: err.message })
  }
})

// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    res.json({ success: true, session: data.session, user: data.user, profile })
  } catch (err) {
    console.error('❌ Error en login:', err)
    res.status(400).json({ error: err.message })
  }
})

// Renovar la sesión usando el refresh token del cliente.
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body
    if (!refresh_token) {
      return res.status(400).json({ error: 'Falta el refresh token' })
    }

    const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token })
    if (error || !data.session) {
      return res.status(401).json({ error: error?.message || 'La sesión expiró' })
    }

    res.json({ session: data.session })
  } catch (err) {
    console.error('❌ Error al renovar sesión:', err)
    res.status(500).json({ error: 'No se pudo renovar la sesión' })
  }
})

// Cerrar sesión
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabaseAuth.auth.signOut()
    if (error) throw error
    res.json({ success: true, message: 'Sesión cerrada' })
  } catch (err) {
    console.error('❌ Error en logout:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router