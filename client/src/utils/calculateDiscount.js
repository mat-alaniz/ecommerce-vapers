/**
 * Calcula el descuento acumulativo basado en unidades previas y los items del carrito
 * @param {number} previousUnits - Unidades ya compradas por el usuario (total_units_purchased)
 * @param {Array} cartItems - Items del carrito con { price, quantity }
 * @returns {Object} { totalWithDiscount, discountAmount, unitsAfterPurchase }
 */
export const calculateDiscount = (previousUnits, cartItems) => {
  // Validar que cartItems sea un array
  if (!Array.isArray(cartItems)) {
    console.warn('calculateDiscount: cartItems no es un array', cartItems)
    return {
      totalWithDiscount: 0,
      discountAmount: 0,
      unitsAfterPurchase: previousUnits || 0
    }
  }
  
  let currentUnits = previousUnits || 0
  let totalWithDiscount = 0
  let discountAmount = 0
  
  for (const item of cartItems) {
    // Validar que item tenga quantity y price
    const quantity = item?.quantity || 0
    const price = item?.price || 0
    
    for (let i = 1; i <= quantity; i++) {
      currentUnits++
      if (currentUnits % 6 === 0) {
        totalWithDiscount += price / 2
        discountAmount += price / 2
      } else {
        totalWithDiscount += price
      }
    }
  }
  
  return {
    totalWithDiscount: Math.round(totalWithDiscount),
    discountAmount: Math.round(discountAmount),
    unitsAfterPurchase: currentUnits
  }
}