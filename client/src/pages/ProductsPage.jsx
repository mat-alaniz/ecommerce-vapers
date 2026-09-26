import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../utils/productsCache'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filtrar
  useEffect(() => {
    let filtered = products
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === selectedBrand)
    }
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.flavor_es.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredProducts(filtered)
  }, [selectedBrand, searchTerm, products])

  const brands = ['all', ...new Set(products.map(p => p.brand))]

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Cargando productos...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Todos los <span className="text-primary">Vapers</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Explorá nuestro catálogo completo de vapers descartables.
        </p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o sabor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg mb-6"
        />
        
        <div className="flex flex-wrap gap-3">
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-5 py-2 rounded-full transition ${
                selectedBrand === brand ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
            >
              {brand === 'all' ? 'Todas' : brand}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default ProductsPage