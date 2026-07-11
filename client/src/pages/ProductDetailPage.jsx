import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import { buildApiUrl } from '../utils/api'

const ProductDetailPage = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(buildApiUrl(`/products/${id}`))
        if (!response.ok) throw new Error('Producto no encontrado')
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product.stock_mobile === 0 && product.stock_warehouse === 0) {
      toast.error('❌ Producto sin stock', {
        duration: 2000,
        icon: '⚠️',
      })
      return
    }
    addToCart(product)
    toast.success(`✨ ${product.name} agregado al carrito`, {
      duration: 2000,
      icon: '🛒',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-gray-600">Cargando producto...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
        <p className="text-gray-600 mb-8">El producto que buscás no existe o fue removido.</p>
        <Link to="/products" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition">
          Ver todos los productos
        </Link>
      </div>
    )
  }

  const hasStock = product.stock_mobile > 0 || product.stock_warehouse > 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">Inicio</Link> / 
        <Link to="/products" className="hover:text-primary mx-1">Productos</Link> / 
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Imagen del producto */}
        <div className="lg:w-1/2">
          <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-2xl" />
            ) : (
              <span className="text-gray-400 text-lg">📦 Imagen de {product.name}</span>
            )}
          </div>
        </div>

        {/* Información del producto */}
        <div className="lg:w-1/2">
          {/* Marca */}
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4">
            {product.brand}
          </span>
          
          {/* Nombre */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {/* Sabor traducido */}
          <p className="text-xl text-gray-600 mb-4">
            Sabor: <span className="font-medium text-gray-800">{product.flavor_es}</span>
          </p>
          
          {/* Precio */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-primary">${product.price}</span>
            {product.is_promo && (
              <span className="ml-4 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                🎉 50% OFF en 6ta unidad
              </span>
            )}
          </div>

          {/* Stock detallado */}
          <div className={`mb-6 p-4 rounded-lg ${hasStock ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-semibold mb-2 ${hasStock ? 'text-green-800' : 'text-red-800'}`}>
              {hasStock ? '✅ Stock disponible' : '❌ Sin stock'}
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">📦 Entrega inmediata (móvil): {product.stock_mobile} unidades</p>
              <p className="text-gray-700">🏠 Coordinar entrega (depósito): {product.stock_warehouse} unidades</p>
            </div>
          </div>

          {/* Descripción */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Especificaciones */}
          {(product.nicotine || product.puffs || product.battery) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Especificaciones</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                {product.nicotine && (
                  <div>
                    <p className="text-gray-500 text-sm">Nicotina</p>
                    <p className="font-medium">{product.nicotine}</p>
                  </div>
                )}
                {product.puffs && (
                  <div>
                    <p className="text-gray-500 text-sm">Puffs</p>
                    <p className="font-medium">{product.puffs}</p>
                  </div>
                )}
                {product.battery && (
                  <div>
                    <p className="text-gray-500 text-sm">Batería</p>
                    <p className="font-medium">{product.battery}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!hasStock}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                hasStock
                  ? 'bg-primary text-white hover:bg-emerald-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasStock ? '🛒 Agregar al carrito' : '❌ Sin stock'}
            </button>
            <Link
              to="/cart"
              className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-semibold"
            >
              Ver carrito
            </Link>
          </div>

          {/* Promo adicional */}
          {product.is_promo && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                🎉 Oferta especial: Llevá 5 unidades y la 6ta tiene 50% de descuento. Acumulativo por usuario.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage