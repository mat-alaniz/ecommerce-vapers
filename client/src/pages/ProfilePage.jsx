import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildApiUrl } from '../utils/api'

const ProfilePage = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const profileData = localStorage.getItem('profile')
    
    if (!token) {
      navigate('/login')
      return
    }
    
    if (profileData) {
      setProfile(JSON.parse(profileData))
    }
    
    fetchOrders(token)
  }, [navigate])

  const fetchOrders = async (token) => {
    try {
      const response = await fetch(buildApiUrl('/orders/history'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setOrders(data)
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Cargando tus datos...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">No se pudo cargar tu perfil</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Cuenta</h1>
      
      {/* Datos personales */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Datos personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Nombre completo</p>
            <p className="font-medium text-gray-800">{profile.full_name || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium text-gray-800">{profile.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Teléfono</p>
            <p className="font-medium text-gray-800">{profile.phone || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Miembro desde</p>
            <p className="font-medium text-gray-800">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-AR') : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Unidades compradas</p>
          <p className="text-3xl font-bold">{profile.total_units_purchased || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Órdenes realizadas</p>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">Total gastado</p>
          <p className="text-3xl font-bold">${totalSpent.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Historial de compras */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Historial de compras</h2>
        
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aún no realizaste compras.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">Orden #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-AR')} - {new Date(order.created_at).toLocaleTimeString('es-AR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${order.total_amount}</p>
                    {order.discount_applied > 0 && (
                      <p className="text-sm text-green-600">Descuento: -${order.discount_applied}</p>
                    )}
                  </div>
                </div>
                
                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex justify-between">
                          <span>{item.quantity}x {item.product_name || `Producto #${item.product_id}`}</span>
                          <span>${item.unit_price} c/u</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage