import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
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

// Cerrar sesión
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    res.json({ success: true, message: 'Sesión cerrada' })
  } catch (err) {
    console.error('❌ Error en logout:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router