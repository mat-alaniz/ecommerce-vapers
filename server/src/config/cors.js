import cors from 'cors'

export const createCorsMiddleware = (
  environment = process.env.NODE_ENV,
  configuredOrigins = process.env.CORS_ORIGINS
) => {
  const allowedOrigins = (configuredOrigins || (
    environment === 'production' ? '' : 'http://localhost:5173'
  ))
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

  if (environment === 'production' && allowedOrigins.length === 0) {
    throw new Error('CORS_ORIGINS debe incluir el dominio del frontend en producción')
  }

  return cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin))
  })
}
