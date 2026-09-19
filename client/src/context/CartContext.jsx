import { createContext, useState, useContext, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  // 🔄 CARGAR CARRITO DESDE localStorage AL INICIAR
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('chevaper_cart')
    return savedCart ? JSON.parse(savedCart) : []})
  // 1. AGREGAR PRODUCTO
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  // 2. ELIMINAR PRODUCTO
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  // 3. ACTUALIZAR CANTIDAD
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // 4. VACIAR CARRITO
  const clearCart = () => {
    setCart([])
  }

  // 5. CALCULAR TOTAL DE ÍTEMS
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // 6. CALCULAR TOTAL A PAGAR
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  // 🔄 GUARDAR CARRITO EN localStorage
  useEffect(() => {
    localStorage.setItem('chevaper_cart', JSON.stringify(cart))
  }, [cart])

  // 7. RETORNAR EL PROVIDER CON TODAS LAS FUNCIONES
  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Este archivo también expone el hook que consumen las páginas del carrito.
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)