import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

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

  // Calcular stock total para mostrar disponibilidad
  const hasStock = product.stock_mobile > 0 || product.stock_warehouse > 0

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      
      {/* Imagen del producto - CLICKEABLE */}
      <Link to={`/product/${product.id}`}>
        <div className="h-48 bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-80 transition">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-500">📦 {product.name}</span>
          )}
        </div>
      </Link>
      
      {/* Contenido de la tarjeta */}
      <div className="p-5">
        
        {/* Marca y nombre */}
        <div className="mb-2">
          <span className="text-sm font-semibold text-primary bg-emerald-50 px-2 py-1 rounded">
            {product.brand}
          </span>
          <h3 className="text-xl font-bold text-gray-800 mt-2">{product.name}</h3>
          <p className="text-gray-600 text-sm">Sabor: {product.flavor_es}</p>
        </div>
        
        {/* Precio */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-2xl font-bold text-gray-900">${product.price}</p>
        </div>
        
        {/* Stock en formato vertical */}
        <div className={`mb-4 text-sm font-medium px-3 py-2 rounded-lg ${
          hasStock 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800 text-center'
        }`}>
          {hasStock ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span>📦</span>
                <span>Móvil: {product.stock_mobile} unidades</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <span>Depósito: {product.stock_warehouse} unidades</span>
              </div>
            </div>
          ) : (
            'Sin stock'
          )}
        </div>
        
        {/* Botones */}
        <div className="flex gap-2">
          <button 
            onClick={handleAddToCart}
            disabled={!hasStock}
            className={`flex-1 font-medium py-3 rounded-lg transition ${
              hasStock 
                ? 'bg-primary hover:bg-emerald-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hasStock ? 'Agregar al carrito' : 'Sin stock'}
          </button>
          
          {/* Botón detalle */}
          <Link
            to={`/product/${product.id}`}
            className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition flex items-center justify-center text-xl"
            title="Ver detalles"
          >
            👁️
          </Link>
        </div>
        
        {/* Promo 6ta unidad */}
        {product.is_promo && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium text-center">
              🎉 50% OFF en la 6ta unidad
            </p>
          </div>
        )}
        
      </div>
    </div>
  )
}

export default ProductCard