import { supabase } from '../config/supabase.js'

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, total_units_purchased, role, created_at')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data
}

export const deleteUser = async (userId) => {
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) throw profileError

  return { success: true, message: 'Usuario eliminado correctamente' }
}
