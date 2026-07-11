import { supabase } from '../config/supabase.js'

export const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No autorizado' })
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return res.status(401).json({ error: error.message })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  
  req.userId = user.id
  next()
}
