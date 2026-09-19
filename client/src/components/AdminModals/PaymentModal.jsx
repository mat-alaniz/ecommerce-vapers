import { useState } from 'react'
import toast from 'react-hot-toast'

const PaymentModal = ({ isOpen, order, onSave, onClose }) => {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')

  if (!isOpen || !order) return null

  const restante = order.total_amount - (order.amount_paid || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      toast.error('Ingresá un monto válido')
      return
    }
    
    if (parseInt(amount) > restante) {
      toast.error(`El monto no puede superar el restante ($${restante})`)
      return
    }
    
    await onSave(order.id, parseInt(amount), paymentMethod)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h3 className="text-xl font-semibold text-blue-800">
            Registrar pago - Orden #{order.id}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Monto restante: <strong className="text-red-600">${restante}</strong>
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto a pagar
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1"
                max={restante}
                placeholder={`Máximo: ${restante}`}
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAmount(restante)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
                >
                  Pago total
                </button>
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                >
                  Pago parcial
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercado_pago">Mercado Pago</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              Registrar pago
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal