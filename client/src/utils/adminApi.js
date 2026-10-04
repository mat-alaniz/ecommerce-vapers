import { buildApiUrl } from './api'

export const getStoredToken = () => localStorage.getItem('token')
export const getStoredRefreshToken = () => localStorage.getItem('refresh_token')

export const getStoredProfile = () => JSON.parse(localStorage.getItem('profile') || '{}')

export const clearStoredSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('expires_at')
  localStorage.removeItem('user')
  localStorage.removeItem('profile')
  window.dispatchEvent(new Event('authChange'))
}

export const isAuthErrorStatus = (status) => status === 401

export const createAuthHeaders = (token, headers = {}) => ({
  ...headers,
  Authorization: `Bearer ${token}`
})

let refreshPromise

const refreshStoredSession = () => {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) return Promise.resolve(null)
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch(buildApiUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  })
    .then(async (response) => {
      if (!response.ok) return null

      const { session } = await response.json()
      if (!session?.access_token) return null

      localStorage.setItem('token', session.access_token)
      localStorage.setItem('refresh_token', session.refresh_token)
      localStorage.setItem('expires_at', String(session.expires_at || ''))
      window.dispatchEvent(new Event('authChange'))
      return session.access_token
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

const getUsableToken = async () => {
  const token = getStoredToken()
  const expiresAt = Number(localStorage.getItem('expires_at'))
  const refreshToken = getStoredRefreshToken()

  if (token && refreshToken && expiresAt && expiresAt * 1000 <= Date.now() + 60_000) {
    return (await refreshStoredSession()) || token
  }

  return token
}

export const adminFetch = async (path, options = {}, onUnauthorized) => {
  let token = await getUsableToken()
  let response = await fetch(buildApiUrl(path), {
    ...options,
    headers: createAuthHeaders(token, options.headers)
  })

  if (response.status === 401 && getStoredRefreshToken()) {
    const refreshedToken = await refreshStoredSession()
    if (refreshedToken) {
      token = refreshedToken
      response = await fetch(buildApiUrl(path), {
        ...options,
        headers: createAuthHeaders(token, options.headers)
      })
    }
  }

  if (isAuthErrorStatus(response.status)) {
    if (onUnauthorized) {
      onUnauthorized()
    }
    return { response, data: null, unauthorized: true }
  }

  let data = null
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    data = await response.json()
  }

  return { response, data, unauthorized: false }
}
