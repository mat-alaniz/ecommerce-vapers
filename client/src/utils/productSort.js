// Ordenar productos: primero los que tienen stock, al final los agotados
export const sortProductsByStock = (products) => {
  return [...products].sort((a, b) => {
    const aHasStock = a.stock_mobile > 0 || a.stock_warehouse > 0
    const bHasStock = b.stock_mobile > 0 || b.stock_warehouse > 0

    // Si ambos tienen stock o ambos no tienen, mantener orden original
    if (aHasStock === bHasStock) return 0

    // El que tiene stock va primero
    return aHasStock ? -1 : 1
  })
}