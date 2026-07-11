import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { buildApiUrl } from '../utils/api'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    setLoading(true)
    
    try {
      // 1. Registrar usuario
      const registerResponse = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })
      
      const registerData = await registerResponse.json()
      
      if (!registerResponse.ok) {
        toast.error(registerData.error || 'Error al registrarse')
        setLoading(false)
        return
      }
      
      toast.success('✅ Registro exitoso. Iniciando sesión...')
      
      // 2. Iniciar sesión automáticamente
      const loginResponse = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      
      const loginData = await loginResponse.json()
      
      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.session.access_token)
        localStorage.setItem('user', JSON.stringify(loginData.user))
        localStorage.setItem('profile', JSON.stringify(loginData.profile))
        
        // 🔥 Disparar evento para actualizar el Navbar
        window.dispatchEvent(new Event('authChange'))
        
        toast.success(`✨ ¡Bienvenido, ${loginData.profile.full_name}!`)
        navigate('/')
      } else {
        toast.error('Registro exitoso, pero no se pudo iniciar sesión automáticamente. Por favor, iniciá sesión manualmente.')
        navigate('/login')
      }
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Crear cuenta
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+54 9 11 1234-5678"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirmar contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Repetí tu contraseña"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-emerald-600 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
        
        <p className="text-center text-gray-600 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage