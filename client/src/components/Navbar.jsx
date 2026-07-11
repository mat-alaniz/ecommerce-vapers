import { FiShoppingCart, FiUser, FiMenu } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { buildApiUrl } from '../utils/api'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  // Cargar usuario desde localStorage al iniciar y escuchar cambios
  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      const profileData = localStorage.getItem('profile')
      
      if (token && userData) {
        setUser(JSON.parse(userData))
        setProfile(JSON.parse(profileData))
      } else {
        setUser(null)
        setProfile(null)
      }
    }
    
    // Cargar al inicio
    loadUserData()
    
    // Escuchar cambios de autenticación
    window.addEventListener('authChange', loadUserData)
    
    return () => window.removeEventListener('authChange', loadUserData)
  }, [])

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await fetch(buildApiUrl('/auth/logout'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (error) {
      console.error('Error en logout:', error)
    }
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('profile')
    setUser(null)
    setProfile(null)
    
    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new Event('authChange'))
    
    toast.success('👋 Sesión cerrada')
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">CheVaper</span>
          </Link>

          {/* MENÚ DESKTOP */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">Inicio</Link>
            <Link to="/products" className="text-gray-700 hover:text-primary font-medium">Productos</Link>
            <Link to="/offers" className="text-gray-700 hover:text-primary font-medium">Ofertas</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary font-medium">Contacto</Link>
          </div>

          {/* ÍCONOS Y USUARIO */}
          <div className="flex items-center space-x-6">
            {/* Carrito */}
            <Link to="/cart" className="relative">
              <FiShoppingCart className="text-2xl text-gray-700 hover:text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Usuario / Login */}
            {user && profile ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-gray-700 font-medium">
                  Hola, {profile.full_name || user.email?.split('@')[0]}
                </span>
                
                {/* BOTÓN ADMIN SOLO SI role = 'admin' */}
                {profile.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
                  >
                    Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center space-x-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition">
                <FiUser />
                <span>Mi cuenta</span>
              </Link>
            )}

            {/* Botón menú móvil */}
            <button 
              className="md:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FiMenu />
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <Link to="/" className="block py-2 text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            <Link to="/products" className="block py-2 text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Productos</Link>
            <Link to="/offers" className="block py-2 text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Ofertas</Link>
            <Link to="/contact" className="block py-2 text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
            <Link to="/cart" className="block py-2 text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Carrito ({totalItems})</Link>
            
            {user && profile ? (
              <>
                <div className="py-2 text-gray-700">Hola, {profile.full_name || user.email?.split('@')[0]}</div>
                {profile.role === 'admin' && (
                  <Link to="/admin" className="block py-2 text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left py-2 text-red-500 hover:text-red-700"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                Iniciar sesión
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar