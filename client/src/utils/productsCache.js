import { buildApiUrl } from './api'

const CACHE_TTL_MS = 15000
const cache = new Map()

export const getProducts = async ({ promoOnly = false } = {}) => {
  const cacheKey = promoOnly ? 'promo' : 'all'
  const entry = cache.get(cacheKey)
  if (entry?.products && Date.now() < entry.expiresAt) return entry.products
  if (entry?.pendingRequest) return entry.pendingRequest

  const pendingRequest = fetch(buildApiUrl(`/products${promoOnly ? '?promo=true' : ''}`))
    .then(async response => {
      if (!response.ok) throw new Error('Error al cargar productos')
      const products = await response.json()
      cache.set(cacheKey, { products, expiresAt: Date.now() + CACHE_TTL_MS })
      return products
    })
    .finally(() => {
      const current = cache.get(cacheKey)
      if (current?.pendingRequest === pendingRequest) {
        cache.set(cacheKey, { products: current.products, expiresAt: current.expiresAt })
      }
    })

  cache.set(cacheKey, { ...entry, pendingRequest })
  return pendingRequest
}

export const invalidateProductsCache = () => {
  cache.clear()
}
