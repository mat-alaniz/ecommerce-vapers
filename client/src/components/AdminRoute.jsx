import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminFetch, clearStoredSession, getStoredProfile, getStoredToken } from '../utils/adminApi'

const AdminRoute = ({ children }) => {
  const token = getStoredToken()
  const profile = getStoredProfile()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!token || profile.role !== 'admin') {
      setIsChecking(false)
      setIsAuthorized(false)
      return
    }

    let isMounted = true

    const verifySession = async () => {
      try {
        const { response, unauthorized } = await adminFetch('/admin/stats', {}, () => {
          clearStoredSession()
          toast.error('Tu sesión de administrador expiró. Iniciá sesión de nuevo.')
        })

        if (!isMounted) return

        if (response.ok) {
          setIsAuthorized(true)
          return
        }

        if (unauthorized) {
          setIsAuthorized(false)
          return
        }

        setIsAuthorized(false)
      } catch (error) {
        if (!isMounted) return
        setIsAuthorized(false)
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [token, profile.role])
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (profile.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (isChecking) {
    return (
      <div className="container mx-auto px-4 py-10 text-center text-gray-600">
        Verificando sesión de administrador...
      </div>
    )
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default AdminRoute