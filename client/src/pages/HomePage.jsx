import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../utils/productsCache'

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cargar productos desde el backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filtrar por marca
  useEffect(() => {
    if (selectedBrand === 'all') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(p => p.brand === selectedBrand))
    }
  }, [selectedBrand, products])

  const brands = ['all', ...new Set(products.map(p => p.brand))]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Vapers Descartables <span className="text-primary">Premium</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Los mejores sabores y marcas del mercado. 
          <span className="font-bold text-primary"> Envíos rápidos</span> y 
          <span className="font-bold text-yellow-600"> 50% de descuento en tu 6ta unidad</span>.
        </p>
      </section>

      {/* Filtros */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-6 py-2 rounded-full transition ${
                selectedBrand === brand 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {brand === 'all' ? 'Todas las marcas' : brand}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de productos */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo 6ta unidad */}
      <section className="mt-16 p-6 bg-gradient-to-r from-primary to-emerald-500 rounded-2xl text-white text-center">
        <h2 className="text-3xl font-bold mb-2">🎉 ¡Oferta Especial!</h2>
        <p className="text-xl">
          Llevá 5 vapers y el 6to es <span className="font-black">50% OFF</span>. Aprovechá ahora.
        </p>
      </section>
    </div>
  )
}

export default HomePage