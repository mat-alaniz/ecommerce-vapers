import { buildApiUrl } from './api'

export const getStoredToken = () => localStorage.getItem('token')

export const getStoredProfile = () => JSON.parse(localStorage.getItem('profile') || '{}')

export const clearStoredSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('profile')
  window.dispatchEvent(new Event('authChange'))
}

export const isAuthErrorStatus = (status) => status === 401 || status === 403

export const createAuthHeaders = (token, headers = {}) => ({
  ...headers,
  Authorization: `Bearer ${token}`
})

export const adminFetch = async (path, options = {}, onUnauthorized) => {
  const token = getStoredToken()
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: createAuthHeaders(token, options.headers)
  })

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
