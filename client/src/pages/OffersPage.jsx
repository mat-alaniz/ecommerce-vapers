import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { buildApiUrl } from '../utils/api'

const OffersPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        const response = await fetch(buildApiUrl('/products'))
        const data = await response.json()
        setProducts(data.filter((product) => product.is_promo))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPromoProducts()
  }, [])

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Cargando ofertas...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 <span className="text-primary">Ofertas Especiales</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Productos con beneficios exclusivos. 
          <span className="font-bold text-yellow-600"> 50% de descuento en tu 6ta unidad</span>.
          Acumulativo sin límite.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No hay ofertas disponibles en este momento.</p>
        </div>
      )}
    </div>
  )
}

export default OffersPage