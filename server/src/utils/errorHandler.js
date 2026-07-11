export const handleError = (res, err, context = '') => {
  console.error(`❌ ${context}:`, err)
  res.status(err.statusCode || 500).json({ error: err.message })
}

export const handleSupabaseError = (error, context = '') => {
  if (error) {
    console.error(`❌ ${context}:`, error)
    throw error
  }
}
