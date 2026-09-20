import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { calculateDiscount } from '../utils/calculateDiscount'
import { generateWhatsAppLink, generateAdminOrderMessage, ADMIN_WHATSAPP } from '../utils/whatsapp'
import { buildApiUrl } from '../utils/api'

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [stockType, setStockType] = useState('')
  const [discountInfo, setDiscountInfo] = useState({ discountAmount: 0, totalWithDiscount: 0 })
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  const mobileStockTotal = cart.reduce((sum, item) => sum + Number(item.stock_mobile || 0), 0)
  const warehouseStockTotal = cart.reduce((sum, item) => sum + Number(item.stock_warehouse || 0), 0)

  // Recalcular descuento cuando cambia el carrito o las unidades acumuladas
  useEffect(() => {
    const previousUnits = profile.total_units_purchased || 0
    const result = calculateDiscount(previousUnits, cart)
    setDiscountInfo(result)
  }, [cart, profile.total_units_purchased])

  const handleCheckout = async () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const currentProfile = JSON.parse(localStorage.getItem('profile') || '{}')

    if (!token) {
      toast.error('Debés iniciar sesión para finalizar la compra')
      navigate('/login')
      return
    }

    if (cart.length === 0) {
      toast.error('No hay productos en el carrito')
      return
    }

    if (!stockType) {
      toast.error('Elegí si querés stock móvil o stock depósito')
      return
    }

    // Preparar items del carrito
    const items = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))

    setLoading(true)

    try {
      const response = await fetch(buildApiUrl('/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          userId: user.id,
          stockType
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Actualizar el perfil en localStorage con el nuevo contador
        const updatedProfile = { ...currentProfile, total_units_purchased: data.totalUnits }
        localStorage.setItem('profile', JSON.stringify(updatedProfile))

        // Toast de confirmación
        toast.success('✅ Pedido registrado. Enviá el mensaje por WhatsApp.', {
          duration: 4000,
          icon: '📲'
        })

        // Preparar datos para el mensaje
        const orderData = {
          orderId: data.orderId,
          customerName: currentProfile.full_name || user.email?.split('@')[0] || 'Cliente',
          customerPhone: currentProfile.phone || 'No especificado',
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: data.total,
          discount: data.discount,
          totalUnits: data.totalUnits,
          stockType
        }

        // Generar el enlace de WhatsApp
        const adminMessage = generateAdminOrderMessage(orderData)
        const whatsappLink = generateWhatsAppLink(ADMIN_WHATSAPP, adminMessage)

        // Vaciar carrito
        clearCart()

        // Redirigir a WhatsApp (después de un pequeño delay para que se vea el toast)
        setTimeout(() => {
          window.location.href = whatsappLink
        }, 1000)

      } else {
        toast.error(data.error || 'Error al procesar la compra')
      }
    } catch (error) {
      console.error('Error en checkout:', error)
      toast.error('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">🛒 Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8">Parece que aún no agregaste productos.</p>
        <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🛍️ Mi Carrito</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de productos */}
        <div className="flex-1">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-600">Marca: {item.brand}</p>
                <p className="text-gray-600">Sabor: {item.flavor_es || item.flavor}</p>
                <p className="text-lg font-bold text-primary mt-2">${item.price}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                  <span>Stock móvil: {item.stock_mobile ?? 0}</span>
                  <span>Stock depósito: {item.stock_warehouse ?? 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Control de cantidad */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateQuantity(item.id, item.quantity - 1)
                      if (item.quantity - 1 === 0) {
                        toast.success(`❌ ${item.name} eliminado del carrito`)
                      } else {
                        toast(`📦 Cantidad: ${item.quantity - 1}`, {
                          duration: 1500,
                          icon: '🔄'
                        })
                      }
                    }}
                    className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => {
                      updateQuantity(item.id, item.quantity + 1)
                      toast.success(`📦 Cantidad aumentada a ${item.quantity + 1}`, {
                        duration: 1500,
                        icon: '➕'
                      })
                    }}
                    className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    +
                  </button>
                </div>

                {/* Precio subtotal */}
                <div className="w-24 text-right">
                  <p className="font-semibold text-gray-800">
                    ${item.price * item.quantity}
                  </p>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={() => {
                    removeFromCart(item.id)
                    toast.error(`🗑️ ${item.name} eliminado`, {
                      duration: 2500,
                      style: {
                        background: '#991b1b',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        borderRadius: '12px',
                        padding: '12px 20px',
                      },
                      icon: '❌',
                    })
                  }}
                  className="text-red-500 hover:text-red-700 transition text-xl"
                  title="Eliminar producto"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:w-80 bg-gray-50 p-6 rounded-xl h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${totalPrice}</span>
            </div>

            {discountInfo.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento (6ta unidad 50%):</span>
                <span>-${discountInfo.discountAmount}</span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total con descuento:</span>
              <span className="text-primary">${discountInfo.totalWithDiscount}</span>
            </div>

            <fieldset className="border-t pt-4 mt-4">
              <legend className="font-semibold text-gray-800 mb-3">Modalidad de entrega</legend>
              <label className="flex items-start gap-3 mb-3 cursor-pointer">
                <input
                  type="radio"
                  name="stockType"
                  value="mobile"
                  checked={stockType === 'mobile'}
                  onChange={(event) => setStockType(event.target.value)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium">Stock móvil</span>
                  <span className="block text-xs text-gray-500">Disponible: {mobileStockTotal} unidades. Entrega inmediata.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="stockType"
                  value="warehouse"
                  checked={stockType === 'warehouse'}
                  onChange={(event) => setStockType(event.target.value)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium">Stock depósito</span>
                  <span className="block text-xs text-gray-500">Disponible: {warehouseStockTotal} unidades. Coordinar entrega por WhatsApp.</span>
                </span>
              </label>
            </fieldset>

            {/* Mostrar progreso hacia el próximo descuento */}
            {profile.total_units_purchased !== undefined && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Unidades acumuladas: <strong>{profile.total_units_purchased}</strong>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${((profile.total_units_purchased % 6) / 6) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {6 - (profile.total_units_purchased % 6)} unidades más para tu próximo 50% OFF
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !stockType}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-emerald-600 transition mb-3 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : stockType ? 'Finalizar compra' : 'Elegí una modalidad'}
          </button>

          <button
            onClick={() => {
              clearCart()
              toast.success('🛒 Carrito vaciado correctamente', {
                duration: 2000,
                icon: '🧹'
              })
            }}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
          >
            Vaciar carrito
          </button>

          <Link to="/" className="block text-center text-primary hover:underline mt-4">
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CartPage
