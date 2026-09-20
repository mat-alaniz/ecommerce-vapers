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

  // 🆕 Validar y formatear el teléfono
  const validateAndFormatPhone = (phone) => {
    // Limpiar el número: quitar espacios, guiones, paréntesis, +54 9, etc.
    let cleanPhone = phone.replace(/\D/g, '')

    // Si el usuario ya puso 549 al principio, quitarlo
    if (cleanPhone.startsWith('549')) {
      cleanPhone = cleanPhone.slice(3)
    }

    // Si empieza con 0, quitarlo
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1)
    }

    // Validar que tenga entre 10 y 11 dígitos
    if (cleanPhone.length < 10) {
      toast.error('El teléfono debe tener al menos 10 dígitos')
      return null
    }

    if (cleanPhone.length > 11) {
      toast.error('El teléfono no puede tener más de 11 dígitos')
      return null
    }

    // Validar que solo tenga números
    if (!/^\d+$/.test(cleanPhone)) {
      toast.error('El teléfono solo puede contener números')
      return null
    }

    // Retornar con prefijo 549
    return `549${cleanPhone}`
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

    // 🆕 Validar y formatear el teléfono
    let phoneWithPrefix = null
    if (formData.phone && formData.phone.trim() !== '') {
      phoneWithPrefix = validateAndFormatPhone(formData.phone)
      if (!phoneWithPrefix) return // La validación falló
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
          phone: phoneWithPrefix, // ← Enviar con prefijo
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
              Teléfono (celular)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="1168011430"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresá tu número sin el 0 ni el 15. Ej: 1168011430
            </p>
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
